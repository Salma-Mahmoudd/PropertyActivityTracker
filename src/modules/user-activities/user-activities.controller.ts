import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto';
import { ActivityFiltersDto } from './dto/activity-filters.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type User } from '@prisma/client';
import { UserActivityResponseDto } from './dto/user-activity-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('User Activities')
@Controller('user-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UserActivitiesController {
  constructor(private readonly userActivitiesService: UserActivitiesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user activity',
    description: 'Creates a new activity for the authenticated user',
  })
  @ApiCreatedResponse({
    type: UserActivityResponseDto,
    description: 'Activity created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Property or activity not found',
  })
  async createUserActivity(
    @CurrentUser() currentUser: User,
    @Body() createActivityDto: CreateUserActivityDto,
  ): Promise<UserActivityResponseDto> {
    return this.userActivitiesService.createUserActivity(
      currentUser.id,
      createActivityDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get user activities for current user',
    description: 'Retrieves all activities for the authenticated user',
  })
  @ApiOkResponse({
    type: [UserActivityResponseDto],
    description: 'List of user activities',
  })
  async findUserActivitiesByUser(
    @CurrentUser() currentUser: User,
  ): Promise<UserActivityResponseDto[]> {
    return this.userActivitiesService.findUserActivitiesByUser(currentUser.id);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all user activities with filters',
    description: 'Retrieves all activities with optional filtering',
  })
  @ApiOkResponse({
    type: [UserActivityResponseDto],
    description: 'List of filtered user activities',
  })
  @ApiQuery({
    name: 'afterTimestamp',
    required: false,
    type: String,
    description: 'Filter activities after this timestamp (ISO string)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter activities by user ID',
  })
  @ApiQuery({
    name: 'activityId',
    required: false,
    type: Number,
    description: 'Filter activities by activity type ID',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter activities from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter activities to this date (YYYY-MM-DD)',
  })
  async findUserActivitiesWithFilters(
    @Query() filtersDto: ActivityFiltersDto,
  ): Promise<UserActivityResponseDto[]> {
    return this.userActivitiesService.findUserActivitiesWithFiltersFromDto(
      filtersDto,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific user activity',
    description: 'Retrieves a specific user activity by ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User activity ID',
  })
  @ApiOkResponse({
    type: UserActivityResponseDto,
    description: 'User activity details',
  })
  @ApiNotFoundResponse({
    description: 'User activity not found',
  })
  async findUserActivity(
    @Param('id', ParseIntPipe) userActivityId: number,
  ): Promise<UserActivityResponseDto> {
    return this.userActivitiesService.findUserActivity(userActivityId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user activity',
    description: 'Updates an existing user activity (only if you own it)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User activity ID',
  })
  @ApiOkResponse({
    type: UserActivityResponseDto,
    description: 'Updated user activity',
  })
  @ApiNotFoundResponse({
    description: 'User activity not found',
  })
  @ApiForbiddenResponse({
    description: 'You can only update your own activities',
  })
  async updateUserActivity(
    @Param('id', ParseIntPipe) userActivityId: number,
    @Body() updateActivityDto: UpdateUserActivityDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserActivityResponseDto> {
    return this.userActivitiesService.updateUserActivity(
      userActivityId,
      updateActivityDto,
      currentUser.id,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user activity',
    description: 'Deletes a user activity (only if you own it)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User activity ID',
  })
  @ApiOkResponse({
    type: UserActivityResponseDto,
    description: 'Deleted user activity',
  })
  @ApiNotFoundResponse({
    description: 'User activity not found',
  })
  @ApiForbiddenResponse({
    description: 'You can only delete your own activities',
  })
  async deleteUserActivity(
    @Param('id', ParseIntPipe) userActivityId: number,
    @CurrentUser() currentUser: User,
  ): Promise<UserActivityResponseDto> {
    return this.userActivitiesService.deleteUserActivity(
      userActivityId,
      currentUser.id,
    );
  }
}
