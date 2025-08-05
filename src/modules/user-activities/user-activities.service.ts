import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto';
import { plainToInstance } from 'class-transformer';
import { UserActivityResponseDto } from './dto/user-activity-response.dto';

@Injectable()
export class UserActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    dto: CreateUserActivityDto,
  ): Promise<UserActivityResponseDto> {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!propertyExists) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    const activity = await this.prisma.activity.findUnique({
      where: { id: dto.activityId },
      select: { id: true, weight: true },
    });
    if (!activity) {
      throw new NotFoundException(
        `Activity with ID ${dto.activityId} not found`,
      );
    }

    const ua = await this.prisma.userActivity.create({
      data: {
        userId,
        propertyId: dto.propertyId,
        activityId: dto.activityId,
        note: dto.note || undefined,
      },
      select: this.defaultSelect(),
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { score: { increment: activity.weight } },
    });

    return plainToInstance(UserActivityResponseDto, ua);
  }

  async findAllByUser(userId: number): Promise<UserActivityResponseDto[]> {
    const uas = await this.prisma.userActivity.findMany({
      where: { userId },
      select: this.defaultSelect(),
    });
    return plainToInstance(UserActivityResponseDto, uas);
  }

  async update(
    id: number,
    dto: UpdateUserActivityDto,
  ): Promise<UserActivityResponseDto> {
    const existing = await this.prisma.userActivity.findUnique({
      where: { id },
      include: { activity: { select: { weight: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`UserActivity with ID ${id} not found`);
    }

    if (dto.propertyId) {
      const propertyExists = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      });
      if (!propertyExists) {
        throw new NotFoundException(
          `Property with ID ${dto.propertyId} not found`,
        );
      }
    }

    if (dto.activityId && dto.activityId !== existing.activityId) {
      const newActivity = await this.prisma.activity.findUnique({
        where: { id: dto.activityId },
        select: { weight: true },
      });
      if (!newActivity) {
        throw new NotFoundException(
          `Activity with ID ${dto.activityId} not found`,
        );
      }

      const scoreDiff = newActivity.weight - existing.activity.weight;
      if (scoreDiff !== 0) {
        await this.prisma.user.update({
          where: { id: existing.userId },
          data: { score: { increment: scoreDiff } },
        });
      }
    }

    const updated = await this.prisma.userActivity.update({
      where: { id },
      data: dto,
      select: this.defaultSelect(),
    });

    return plainToInstance(UserActivityResponseDto, updated);
  }

  async remove(id: number): Promise<UserActivityResponseDto> {
    const existing = await this.prisma.userActivity.findUnique({
      where: { id },
      include: { activity: { select: { weight: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`UserActivity with ID ${id} not found`);
    }

    const deleted = await this.prisma.userActivity.delete({
      where: { id },
      select: this.defaultSelect(),
    });

    await this.prisma.user.update({
      where: { id: existing.userId },
      data: { score: { decrement: existing.activity.weight } },
    });

    return plainToInstance(UserActivityResponseDto, deleted);
  }

  private defaultSelect() {
    return {
      id: true,
      userId: true,
      propertyId: true,
      activityId: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true, score: true } },
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
