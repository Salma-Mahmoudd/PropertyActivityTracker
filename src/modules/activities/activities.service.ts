import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { plainToInstance } from 'class-transformer';
import { ActivityResponseDto } from './dto/activity-response.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create a new activity type
   * @param createActivityData - Activity data to create
   * @returns Created activity
   */
  async createActivity(
    createActivityData: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    const newActivity = await this.prismaService.activity.create({
      data: createActivityData,
    });
    return plainToInstance(ActivityResponseDto, newActivity);
  }

  /**
   * Get all activity types ordered by name
   * @returns Array of all activities
   */
  async getAllActivities(): Promise<ActivityResponseDto[]> {
    const allActivities = await this.prismaService.activity.findMany({
      orderBy: { name: 'asc' },
    });
    return plainToInstance(ActivityResponseDto, allActivities);
  }

  /**
   * Get activity by ID
   * @param activityId - Activity ID to find
   * @returns Activity with specified ID
   * @throws NotFoundException if activity not found
   */
  async getActivityById(activityId: number): Promise<ActivityResponseDto> {
    const foundActivity = await this.prismaService.activity.findUnique({
      where: { id: activityId },
    });

    if (!foundActivity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    return plainToInstance(ActivityResponseDto, foundActivity);
  }

  /**
   * Update activity by ID
   * @param activityId - Activity ID to update
   * @param updateActivityData - Updated activity data
   * @returns Updated activity
   * @throws NotFoundException if activity not found
   */
  async updateActivity(
    activityId: number,
    updateActivityData: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    // Verify activity exists
    await this.getActivityById(activityId);

    const updatedActivity = await this.prismaService.activity.update({
      where: { id: activityId },
      data: updateActivityData,
    });

    return plainToInstance(ActivityResponseDto, updatedActivity);
  }

  /**
   * Delete activity by ID
   * @param activityId - Activity ID to delete
   * @returns Deleted activity
   * @throws NotFoundException if activity not found
   */
  async deleteActivity(activityId: number): Promise<ActivityResponseDto> {
    // Verify activity exists
    await this.getActivityById(activityId);

    const deletedActivity = await this.prismaService.activity.delete({
      where: { id: activityId },
    });

    return plainToInstance(ActivityResponseDto, deletedActivity);
  }

  /**
   * Get activity by name
   * @param activityName - Activity name to find
   * @returns Activity with specified name or null if not found
   */
  async getActivityByName(
    activityName: string,
  ): Promise<ActivityResponseDto | null> {
    const foundActivity = await this.prismaService.activity.findUnique({
      where: { name: activityName },
    });

    return foundActivity
      ? plainToInstance(ActivityResponseDto, foundActivity)
      : null;
  }
}
