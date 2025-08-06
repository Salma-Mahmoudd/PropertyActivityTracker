import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
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
  private connectedUsers = new Map<number, string>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const handshake = client.handshake as {
        auth?: { token?: string };
        headers?: { authorization?: string };
      };
      const token =
        (typeof handshake?.auth?.token === 'string'
          ? handshake.auth.token
          : undefined) ||
        (typeof handshake?.headers?.authorization === 'string'
          ? handshake.headers.authorization.replace('Bearer ', '')
          : undefined);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{
        sub: string | number;
        email: string;
      }>(token);
      client.userId = Number(payload.sub);
      client.userEmail = payload.email;

      this.connectedUsers.set(client.userId, String(client.id));

      await this.prisma.user.update({
        where: { id: client.userId },
        data: {
          status: UserStatus.ONLINE,
          lastSeen: null,
        },
      });

      this.logger.log(`User ${client.userId} connected`);

      client.broadcast.emit('user-status-changed', {
        userId: client.userId,
        status: 'ONLINE',
      });
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);

      await this.prisma.user.update({
        where: { id: client.userId },
        data: {
          status: UserStatus.OFFLINE,
          lastSeen: new Date(),
        },
      });

      this.logger.log(`User ${client.userId} disconnected`);

      client.broadcast.emit('user-status-changed', {
        userId: client.userId,
        status: 'OFFLINE',
      });
    }
  }

  broadcastActivity(activityData: any) {
    this.server.emit('live-activity', {
      ...activityData,
      timestamp: new Date(),
    });
  }

  sendNotification(message: string, data?: unknown) {
    this.server.emit('notification', {
      message,
      data,
      timestamp: new Date(),
    });
  }

  async sendReplay(userId: number, lastSeenAt: Date) {
    const socketId = this.connectedUsers.get(userId);
    if (!socketId) return;

    try {
      const missedActivities = await this.prisma.userActivity.findMany({
        where: {
          createdAt: {
            gt: lastSeenAt,
          },
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
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (missedActivities.length > 0) {
        this.server.to(socketId).emit('replay-start', {
          totalActivities: missedActivities.length,
          speed: 10,
        });

        for (let i = 0; i < missedActivities.length; i++) {
          setTimeout(() => {
            this.server.to(socketId).emit('replay-activity', {
              ...missedActivities[i],
              replayIndex: i + 1,
              totalActivities: missedActivities.length,
            });

            if (i === missedActivities.length - 1) {
              setTimeout(() => {
                this.server.to(socketId).emit('replay-end');
              }, 100);
            }
          }, i * 100);
        }
      }
    } catch (error) {
      this.logger.error('Error sending replay:', error);
    }
  }

  @SubscribeMessage('get-online-users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUsers = await this.prisma.user.findMany({
      where: { status: UserStatus.ONLINE },
      select: { id: true, name: true, email: true, status: true, score: true },
    });

    client.emit('online-users', onlineUsers);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date() });
  }
}
