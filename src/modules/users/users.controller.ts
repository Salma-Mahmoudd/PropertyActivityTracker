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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, AccountStatus } from '@prisma/client';
import type { User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user (Admin only)',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'User created successfully',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves all users (Admin only)',
  })
  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'List of all users',
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the profile of the authenticated user',
  })
  @ApiOkResponse({
    type: PublicUserResponseDto,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @CurrentUser() currentUser: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<PublicUserResponseDto> {
    return this.usersService.updateUserProfile(
      currentUser.id,
      updateProfileDto,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the authenticated user',
  })
  @ApiOkResponse({
    type: PublicUserResponseDto,
    description: 'Current user profile',
  })
  async getProfile(
    @CurrentUser() currentUser: User,
  ): Promise<PublicUserResponseDto> {
    return this.usersService.findPublicUserById(currentUser.id);
  }

  @Get('public/list')
  @ApiOperation({
    summary: 'Get public users list',
    description: 'Retrieves list of public users (active, non-admin)',
  })
  @ApiOkResponse({
    type: [PublicUserResponseDto],
    description: 'List of public users',
  })
  async getPublicUsers(): Promise<PublicUserResponseDto[]> {
    return this.usersService.getPublicUsers();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by ID (Admin only)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User details',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async findUserById(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findUserById(userId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates a specific user (Admin only)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete user',
    description: 'Soft deletes a user (Admin only)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User soft deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async softDeleteUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.softDeleteUser(userId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update user account status',
    description: 'Updates the account status of a user (Admin only)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User status updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBody({
    description: 'Set account status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(AccountStatus) },
      },
      required: ['status'],
    },
  })
  async updateAccountStatus(
    @Param('id', ParseIntPipe) userId: number,
    @Body('status') status: AccountStatus,
  ): Promise<UserResponseDto> {
    return this.usersService.updateAccountStatus(userId, status);
  }
}
