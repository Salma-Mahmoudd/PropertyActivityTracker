import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { plainToInstance } from 'class-transformer';
import { ActivityResponseDto } from './dto/activity-response.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityDto): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.create({ data });
    return plainToInstance(ActivityResponseDto, activity);
  }

  async findAll(): Promise<ActivityResponseDto[]> {
    const activities = await this.prisma.activity.findMany();
    return plainToInstance(ActivityResponseDto, activities);
  }

  async findOne(id: number): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity)
      throw new NotFoundException(`Activity with ID ${id} not found`);
    return plainToInstance(ActivityResponseDto, activity);
  }

  async update(
    id: number,
    data: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    await this.findOne(id);
    const updated = await this.prisma.activity.update({
      where: { id },
      data,
    });
    return plainToInstance(ActivityResponseDto, updated);
  }

  async remove(id: number): Promise<ActivityResponseDto> {
    await this.findOne(id);
    const deleted = await this.prisma.activity.delete({ where: { id } });
    return plainToInstance(ActivityResponseDto, deleted);
  }
}
