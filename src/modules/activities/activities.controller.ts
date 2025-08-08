import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ActivityResponseDto } from './dto/activity-response.dto';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new activity type' })
  @ApiCreatedResponse({
    type: ActivityResponseDto,
    description: 'Activity created successfully',
  })
  async createActivity(
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.createActivity(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activity types' })
  @ApiOkResponse({
    type: ActivityResponseDto,
    isArray: true,
    description: 'List of all activity types',
  })
  async getAllActivities(): Promise<ActivityResponseDto[]> {
    return this.activitiesService.getAllActivities();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiParam({ name: 'id', description: 'Activity ID', type: 'number' })
  @ApiOkResponse({
    type: ActivityResponseDto,
    description: 'Activity found successfully',
  })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  async getActivityById(
    @Param('id', ParseIntPipe) activityId: number,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.getActivityById(activityId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity by ID' })
  @ApiParam({ name: 'id', description: 'Activity ID', type: 'number' })
  @ApiOkResponse({
    type: ActivityResponseDto,
    description: 'Activity updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  async updateActivity(
    @Param('id', ParseIntPipe) activityId: number,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.updateActivity(activityId, updateActivityDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity by ID' })
  @ApiParam({ name: 'id', description: 'Activity ID', type: 'number' })
  @ApiOkResponse({
    type: ActivityResponseDto,
    description: 'Activity deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Activity not found' })
  async deleteActivity(
    @Param('id', ParseIntPipe) activityId: number,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.deleteActivity(activityId);
  }
}
