import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import {
  AuthenticatedSocket,
  JwtPayload,
  HandshakeData,
  ReplayActivityData,
} from './interfaces/activity.interface';
import {
  ACTIVITY_CONSTANTS,
  WEBSOCKET_EVENTS,
} from './constants/activity.constants';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/activities',
})
export class ActivitiesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ActivitiesGateway.name);
  private readonly connectedUsers = new Map<number, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Handle WebSocket connection
   * @param client - Authenticated socket client
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const authToken = this.extractAuthToken(client);
      if (!authToken) {
        this.logger.warn('No authentication token provided');
        client.disconnect();
        return;
      }

      const tokenPayload = this.jwtService.verify<JwtPayload>(authToken);
      client.userId = Number(tokenPayload.sub);
      client.userEmail = tokenPayload.email;

      this.connectedUsers.set(client.userId, client.id);
      await this.updateUserStatus(client.userId, UserStatus.ONLINE);

      this.logger.log(`User ${client.userId} (${client.userEmail}) connected`);

      this.broadcastUserStatusChange(client.userId, 'ONLINE', client.userEmail);

      // Send replay for missed activities
      await this.handleReplayForUser(client.userId);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   * @param client - Authenticated socket client
   */
  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    if (!client.userId) return;

    this.connectedUsers.delete(client.userId);
    await this.updateUserStatus(client.userId, UserStatus.OFFLINE);

    this.logger.log(`User ${client.userId} disconnected`);
    this.broadcastUserStatusChange(client.userId, 'OFFLINE', client.userEmail);
  }

  /**
   * Broadcast activity to all connected clients
   * @param activityData - Activity data to broadcast
   */
  broadcastActivity(activityData: Record<string, unknown>): void {
    this.server.emit(WEBSOCKET_EVENTS.LIVE_ACTIVITY, {
      ...activityData,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to all connected clients
   * @param message - Notification message
   * @param data - Additional notification data
   * @param type - Notification type (success, error, info, warning)
   */
  sendNotification(
    message: string,
    data?: unknown,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
  ): void {
    this.server.emit(WEBSOCKET_EVENTS.NOTIFICATION, {
      message,
      data,
      type,
      timestamp: new Date(),
    });
  }

  /**
   * Send replay of missed activities to a specific user
   * @param userId - User ID to send replay to
   * @param lastSeenAt - Timestamp of last seen activity
   */
  async sendReplayForUser(userId: number, lastSeenAt: Date): Promise<void> {
    const socketId = this.connectedUsers.get(userId);
    if (!socketId) {
      this.logger.warn(`User ${userId} not connected for replay`);
      return;
    }

    try {
      const missedActivities = await this.getMissedActivities(lastSeenAt);

      if (missedActivities.length === 0) {
        this.logger.log(`No missed activities for user ${userId}`);
        return;
      }

      this.logger.log(
        `Sending replay of ${missedActivities.length} activities to user ${userId}`,
      );

      this.server.to(socketId).emit(WEBSOCKET_EVENTS.REPLAY_START, {
        totalActivities: missedActivities.length,
        speed: ACTIVITY_CONSTANTS.REPLAY_SPEED_MULTIPLIER,
        timestamp: new Date(),
      });

      await this.sendReplayActivities(socketId, missedActivities);
    } catch (error) {
      this.logger.error(`Error sending replay for user ${userId}:`, error);
    }
  }

  /**
   * Handle get online users request
   * @param client - Authenticated socket client
   */
  @SubscribeMessage('get-online-users')
  async handleGetOnlineUsers(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const onlineUsers = await this.prismaService.user.findMany({
        where: { status: UserStatus.ONLINE },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          score: true,
          lastSeen: true,
        },
      });

      client.emit(WEBSOCKET_EVENTS.ONLINE_USERS, {
        users: onlineUsers,
        count: onlineUsers.length,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error fetching online users:', error);
      client.emit(WEBSOCKET_EVENTS.NOTIFICATION, {
        message: 'Failed to fetch online users',
        type: 'error',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle ping request
   * @param client - Authenticated socket client
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket): void {
    client.emit(WEBSOCKET_EVENTS.PONG, {
      timestamp: new Date(),
      userId: client.userId,
    });
  }

  /**
   * Extract authentication token from client
   * @param client - Authenticated socket client
   * @returns Authentication token or null
   */
  private extractAuthToken(client: AuthenticatedSocket): string | null {
    const handshake = client.handshake as HandshakeData;

    const authToken = handshake?.auth?.token;
    if (typeof authToken === 'string') return authToken;

    const headerToken = handshake?.headers?.authorization;
    if (typeof headerToken === 'string') {
      return headerToken.replace('Bearer ', '');
    }

    return null;
  }

  /**
   * Update user status in database
   * @param userId - User ID
   * @param status - New user status
   */
  private async updateUserStatus(
    userId: number,
    status: UserStatus,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        status,
        lastSeen: status === UserStatus.OFFLINE ? new Date() : null,
      },
    });
  }

  /**
   * Broadcast user status change to all clients
   * @param userId - User ID
   * @param status - New status
   * @param userEmail - User email
   */
  private broadcastUserStatusChange(
    userId: number,
    status: string,
    userEmail?: string,
  ): void {
    this.server.emit(WEBSOCKET_EVENTS.USER_STATUS_CHANGED, {
      userId,
      status,
      userEmail,
      timestamp: new Date(),
    });
  }

  /**
   * Handle replay for user's missed activities
   * @param userId - User ID to send replay to
   */
  private async handleReplayForUser(userId: number): Promise<void> {
    try {
      const foundUser = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { lastSeen: true },
      });

      if (foundUser?.lastSeen) {
        // Use setTimeout to avoid blocking the connection
        setTimeout(() => {
          void this.sendReplayForUser(userId, foundUser.lastSeen);
        }, ACTIVITY_CONSTANTS.REPLAY_DELAY_MS);
      }
    } catch (error) {
      this.logger.error(`Failed to handle replay for user ${userId}:`, error);
    }
  }

  /**
   * Get missed activities since last seen
   * @param lastSeenAt - Timestamp of last seen activity
   * @returns Array of missed activities
   */
  private async getMissedActivities(
    lastSeenAt: Date,
  ): Promise<ReplayActivityData[]> {
    return this.prismaService.userActivity.findMany({
      where: {
        createdAt: { gt: lastSeenAt },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            address: true,
          },
        },
        activity: {
          select: {
            id: true,
            name: true,
            weight: true,
            icon: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Send replay activities to a specific socket
   * @param socketId - Socket ID to send to
   * @param activities - Activities to replay
   */
  private async sendReplayActivities(
    socketId: string,
    activities: ReplayActivityData[],
  ): Promise<void> {
    const replaySpeed = ACTIVITY_CONSTANTS.REPLAY_INTERVAL_MS;

    for (
      let activityIndex = 0;
      activityIndex < activities.length;
      activityIndex++
    ) {
      await new Promise((resolve) => {
        setTimeout(() => {
          const currentActivity = activities[activityIndex];
          this.server.to(socketId).emit(WEBSOCKET_EVENTS.REPLAY_ACTIVITY, {
            ...currentActivity,
            replayIndex: activityIndex + 1,
            totalActivities: activities.length,
            replaySpeed: ACTIVITY_CONSTANTS.REPLAY_SPEED_MULTIPLIER,
          });

          if (activityIndex === activities.length - 1) {
            setTimeout(() => {
              this.server.to(socketId).emit(WEBSOCKET_EVENTS.REPLAY_END, {
                totalActivities: activities.length,
                replayDuration: activities.length * replaySpeed,
              });
            }, ACTIVITY_CONSTANTS.REPLAY_INTERVAL_MS);
          }
          resolve(undefined);
        }, activityIndex * replaySpeed);
      });
    }
  }
}
