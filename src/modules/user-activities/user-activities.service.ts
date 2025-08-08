import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto';
import { plainToInstance } from 'class-transformer';
import { UserActivityResponseDto } from './dto/user-activity-response.dto';
import { ActivitiesGateway } from './activities.gateway';
import {
  ActivityFilters,
  ActivityWithWeight,
} from './interfaces/activity.interface';
import { ACTIVITY_CONSTANTS } from './constants/activity.constants';
import { ActivityFiltersDto } from './dto/activity-filters.dto';

@Injectable()
export class UserActivitiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly activitiesGateway: ActivitiesGateway,
  ) {}

  /**
   * Create a new user activity
   * @param userId - ID of the user creating the activity
   * @param createActivityDto - Activity data to create
   * @returns Created user activity
   */
  async createUserActivity(
    userId: number,
    createActivityDto: CreateUserActivityDto,
  ): Promise<UserActivityResponseDto> {
    await this.validatePropertyAndActivity(
      createActivityDto.propertyId,
      createActivityDto.activityId,
    );

    const activityWithWeight = await this.fetchActivityWithWeight(
      createActivityDto.activityId,
    );

    const newUserActivity = await this.createActivityRecord(
      userId,
      createActivityDto,
    );

    await this.updateUserScore(userId, activityWithWeight.weight);

    this.activitiesGateway.broadcastActivity({
      ...newUserActivity,
      type: 'user-activity-created',
    });

    await this.checkAndSendNotifications(userId, activityWithWeight);

    return plainToInstance(UserActivityResponseDto, newUserActivity);
  }

  /**
   * Get all activities for a specific user
   * @param userId - ID of the user
   * @returns Array of user activities
   */
  async findUserActivitiesByUser(
    userId: number,
  ): Promise<UserActivityResponseDto[]> {
    const userActivities = await this.prismaService.userActivity.findMany({
      where: { userId },
      select: this.getDefaultSelectFields(),
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(UserActivityResponseDto, userActivities);
  }

  /**
   * Get all user activities
   * @returns Array of all user activities
   */
  async findAllUserActivities(): Promise<UserActivityResponseDto[]> {
    const allUserActivities = await this.prismaService.userActivity.findMany({
      select: this.getDefaultSelectFields(),
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(UserActivityResponseDto, allUserActivities);
  }

  /**
   * Get user activities with filters
   * @param filters - Filter criteria
   * @returns Array of filtered user activities
   */
  async findUserActivitiesWithFilters(
    filters: ActivityFilters,
  ): Promise<UserActivityResponseDto[]> {
    const whereClause = this.buildWhereClause(filters);

    const filteredUserActivities =
      await this.prismaService.userActivity.findMany({
        where: whereClause,
        select: this.getDefaultSelectFields(),
        orderBy: { createdAt: 'desc' },
        take: ACTIVITY_CONSTANTS.MAX_ACTIVITIES_PER_QUERY,
      });

    return plainToInstance(UserActivityResponseDto, filteredUserActivities);
  }

  /**
   * Get user activities with filters from DTO
   * @param filtersDto - Activity filters DTO
   * @returns Array of filtered user activities
   */
  async findUserActivitiesWithFiltersFromDto(
    filtersDto: ActivityFiltersDto,
  ): Promise<UserActivityResponseDto[]> {
    const filters = this.convertFiltersDtoToActivityFilters(filtersDto);
    return this.findUserActivitiesWithFilters(filters);
  }

  /**
   * Get user activities after a specific timestamp
   * @param timestamp - Timestamp to filter from
   * @returns Array of user activities after timestamp
   */
  async findUserActivitiesAfterTimestamp(
    timestamp: Date,
  ): Promise<UserActivityResponseDto[]> {
    const userActivitiesAfterTimestamp =
      await this.prismaService.userActivity.findMany({
        where: {
          createdAt: { gt: timestamp },
        },
        select: this.getDefaultSelectFields(),
        orderBy: { createdAt: 'asc' },
      });
    return plainToInstance(
      UserActivityResponseDto,
      userActivitiesAfterTimestamp,
    );
  }

  /**
   * Get a specific user activity by ID
   * @param userActivityId - ID of the user activity
   * @returns User activity details
   * @throws NotFoundException if user activity not found
   */
  async findUserActivity(
    userActivityId: number,
  ): Promise<UserActivityResponseDto> {
    const foundUserActivity = await this.prismaService.userActivity.findUnique({
      where: { id: userActivityId },
      select: this.getDefaultSelectFields(),
    });

    if (!foundUserActivity) {
      throw new NotFoundException(
        `UserActivity with ID ${userActivityId} not found`,
      );
    }

    return plainToInstance(UserActivityResponseDto, foundUserActivity);
  }

  /**
   * Update a user activity
   * @param userActivityId - ID of the user activity to update
   * @param updateActivityDto - Updated activity data
   * @param currentUserId - ID of the current user (for ownership validation)
   * @returns Updated user activity
   * @throws NotFoundException if user activity not found
   * @throws ForbiddenException if user doesn't own the activity
   */
  async updateUserActivity(
    userActivityId: number,
    updateActivityDto: UpdateUserActivityDto,
    currentUserId: number,
  ): Promise<UserActivityResponseDto> {
    const existingActivity =
      await this.findUserActivityWithActivity(userActivityId);

    // Check if the current user owns this activity
    if (existingActivity.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own activities');
    }

    if (
      updateActivityDto.propertyId &&
      updateActivityDto.propertyId !== existingActivity.propertyId
    ) {
      await this.validateProperty(updateActivityDto.propertyId);
    }

    let scoreDifference = 0;
    if (
      updateActivityDto.activityId &&
      updateActivityDto.activityId !== existingActivity.activityId
    ) {
      scoreDifference = await this.calculateScoreDifference(
        existingActivity.activity.weight,
        updateActivityDto.activityId,
      );
    }

    const updatedUserActivity = await this.prismaService.userActivity.update({
      where: { id: userActivityId },
      data: updateActivityDto,
      select: this.getDefaultSelectFields(),
    });

    if (scoreDifference !== 0) {
      await this.updateUserScore(existingActivity.userId, scoreDifference);
    }

    return plainToInstance(UserActivityResponseDto, updatedUserActivity);
  }

  /**
   * Delete a user activity
   * @param userActivityId - ID of the user activity to delete
   * @param currentUserId - ID of the current user (for ownership validation)
   * @returns Deleted user activity
   * @throws NotFoundException if user activity not found
   * @throws ForbiddenException if user doesn't own the activity
   */
  async deleteUserActivity(
    userActivityId: number,
    currentUserId: number,
  ): Promise<UserActivityResponseDto> {
    const existingActivity =
      await this.findUserActivityWithActivity(userActivityId);

    // Check if the current user owns this activity
    if (existingActivity.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own activities');
    }

    const deletedUserActivity = await this.prismaService.userActivity.delete({
      where: { id: userActivityId },
      select: this.getDefaultSelectFields(),
    });

    if (existingActivity.activity.weight > 0) {
      await this.updateUserScore(
        existingActivity.userId,
        -existingActivity.activity.weight,
      );
    }

    return plainToInstance(UserActivityResponseDto, deletedUserActivity);
  }

  /**
   * Validate property and activity exist
   * @param propertyId - Property ID to validate
   * @param activityId - Activity ID to validate
   */
  private async validatePropertyAndActivity(
    propertyId: number,
    activityId: number,
  ): Promise<void> {
    await Promise.all([
      this.validateProperty(propertyId),
      this.validateActivity(activityId),
    ]);
  }

  /**
   * Validate property exists
   * @param propertyId - Property ID to validate
   * @throws NotFoundException if property not found
   */
  private async validateProperty(propertyId: number): Promise<void> {
    const foundProperty = await this.prismaService.property.findUnique({
      where: { id: propertyId },
    });
    if (!foundProperty) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
  }

  /**
   * Validate activity exists
   * @param activityId - Activity ID to validate
   * @throws NotFoundException if activity not found
   */
  private async validateActivity(activityId: number): Promise<void> {
    const foundActivity = await this.prismaService.activity.findUnique({
      where: { id: activityId },
    });
    if (!foundActivity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }
  }

  /**
   * Fetch activity with weight information
   * @param activityId - Activity ID to fetch
   * @returns Activity with weight information
   * @throws NotFoundException if activity not found
   */
  private async fetchActivityWithWeight(
    activityId: number,
  ): Promise<ActivityWithWeight> {
    const foundActivity = await this.prismaService.activity.findUnique({
      where: { id: activityId },
      select: { id: true, weight: true, name: true },
    });
    if (!foundActivity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }
    return foundActivity;
  }

  /**
   * Create activity record in database
   * @param userId - User ID
   * @param createActivityDto - Activity data
   * @returns Created activity record
   */
  private async createActivityRecord(
    userId: number,
    createActivityDto: CreateUserActivityDto,
  ) {
    return this.prismaService.userActivity.create({
      data: {
        userId,
        propertyId: createActivityDto.propertyId,
        activityId: createActivityDto.activityId,
        note: createActivityDto.note,
        latitude: createActivityDto.latitude,
        longitude: createActivityDto.longitude,
      },
      select: this.getDefaultSelectFields(),
    });
  }

  /**
   * Update user score
   * @param userId - User ID
   * @param scoreIncrement - Score to add/subtract
   */
  private async updateUserScore(
    userId: number,
    scoreIncrement: number,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { score: { increment: scoreIncrement } },
    });
  }

  /**
   * Check and send notifications based on activity
   * @param userId - User ID
   * @param activity - Activity with weight information
   */
  private async checkAndSendNotifications(
    userId: number,
    activity: ActivityWithWeight,
  ): Promise<void> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, score: true },
    });

    if (!foundUser) return;

    const newScore = foundUser.score + activity.weight;

    if (
      newScore >= ACTIVITY_CONSTANTS.NOTIFICATION_SCORE_THRESHOLD &&
      foundUser.score < ACTIVITY_CONSTANTS.NOTIFICATION_SCORE_THRESHOLD
    ) {
      this.activitiesGateway.sendNotification(
        `${foundUser.name} reached ${ACTIVITY_CONSTANTS.NOTIFICATION_SCORE_THRESHOLD} points!`,
        {
          userId: foundUser.id,
          score: newScore,
        },
      );
    }

    if (activity.weight >= ACTIVITY_CONSTANTS.HIGH_IMPACT_ACTIVITY_WEIGHT) {
      this.activitiesGateway.sendNotification(
        `${foundUser.name} had an opportunity!`,
        {
          userId: foundUser.id,
          activityName: activity.name,
          weight: activity.weight,
        },
      );
    }
  }

  /**
   * Find user activity with activity information
   * @param userActivityId - User activity ID
   * @returns User activity with activity information
   * @throws NotFoundException if user activity not found
   */
  private async findUserActivityWithActivity(userActivityId: number) {
    const existingUserActivity =
      await this.prismaService.userActivity.findUnique({
        where: { id: userActivityId },
        include: {
          activity: { select: { weight: true } },
        },
      });
    if (!existingUserActivity) {
      throw new NotFoundException(
        `UserActivity with ID ${userActivityId} not found`,
      );
    }
    return existingUserActivity;
  }

  /**
   * Calculate score difference between activities
   * @param currentWeight - Current activity weight
   * @param newActivityId - New activity ID
   * @returns Score difference
   * @throws NotFoundException if new activity not found
   */
  private async calculateScoreDifference(
    currentWeight: number,
    newActivityId: number,
  ): Promise<number> {
    const newActivity = await this.prismaService.activity.findUnique({
      where: { id: newActivityId },
      select: { weight: true },
    });
    if (!newActivity) {
      throw new NotFoundException(
        `Activity with ID ${newActivityId} not found`,
      );
    }
    return newActivity.weight - currentWeight;
  }

  /**
   * Build where clause for filtering
   * @param filters - Filter criteria
   * @returns Prisma where clause
   */
  private buildWhereClause(filters: ActivityFilters) {
    const whereClause: import('@prisma/client').Prisma.UserActivityWhereInput =
      {};

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.activityId) {
      whereClause.activityId = filters.activityId;
    }

    if (filters.afterTimestamp || filters.dateFrom || filters.dateTo) {
      whereClause.createdAt = {};

      if (filters.afterTimestamp) {
        // Ensure afterTimestamp is a Date object
        const afterDate =
          filters.afterTimestamp instanceof Date
            ? filters.afterTimestamp
            : new Date(filters.afterTimestamp);
        whereClause.createdAt.gt = afterDate;
      }

      if (filters.dateFrom) {
        // Ensure dateFrom is a Date object
        const fromDate =
          filters.dateFrom instanceof Date
            ? filters.dateFrom
            : new Date(filters.dateFrom);
        whereClause.createdAt.gte = fromDate;
      }

      if (filters.dateTo) {
        // Ensure dateTo is a Date object and set to end of day
        const toDate =
          filters.dateTo instanceof Date
            ? filters.dateTo
            : new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = toDate;
      }
    }

    return whereClause;
  }

  /**
   * Convert ActivityFiltersDto to ActivityFilters interface
   * @param filtersDto - Activity filters DTO
   * @returns ActivityFilters object
   */
  private convertFiltersDtoToActivityFilters(
    filtersDto: ActivityFiltersDto,
  ): ActivityFilters {
    const filters: ActivityFilters = {};

    if (filtersDto.afterTimestamp) {
      try {
        const date = new Date(filtersDto.afterTimestamp);
        if (!isNaN(date.getTime())) {
          filters.afterTimestamp = date;
        }
      } catch {
        // Ignore invalid date format
      }
    }

    if (filtersDto.userId !== undefined && filtersDto.userId !== null) {
      const userId = Number(filtersDto.userId);
      if (!isNaN(userId) && userId > 0) {
        filters.userId = userId;
      }
    }

    if (filtersDto.activityId !== undefined && filtersDto.activityId !== null) {
      const activityId = Number(filtersDto.activityId);
      if (!isNaN(activityId) && activityId > 0) {
        filters.activityId = activityId;
      }
    }

    if (filtersDto.dateFrom) {
      try {
        const date = new Date(filtersDto.dateFrom);
        if (!isNaN(date.getTime())) {
          filters.dateFrom = date;
        }
      } catch {
        // Ignore invalid date format
      }
    }

    if (filtersDto.dateTo) {
      try {
        const date = new Date(filtersDto.dateTo);
        if (!isNaN(date.getTime())) {
          filters.dateTo = date;
        }
      } catch {
        // Ignore invalid date format
      }
    }

    return filters;
  }

  /**
   * Get default select fields for user activities
   * @returns Default select fields
   */
  private getDefaultSelectFields() {
    return {
      id: true,
      userId: true,
      propertyId: true,
      activityId: true,
      note: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          score: true,
        },
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
    };
  }
}
