import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccountStatus, UserRole, UserStatus, Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Generate avatar URL for user
   * @param userName - User name to generate avatar for
   * @returns Avatar URL
   */
  private generateAvatarUrl(userName: string): string {
    const encodedName = encodeURIComponent(userName);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=200`;
  }

  /**
   * Create a new user
   * @param createUserData - User data to create
   * @returns Created user
   * @throws ConflictException if email already exists
   */
  async createUser(createUserData: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email: createUserData.email,
        accountStatus: { not: AccountStatus.DELETED },
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserData.password, 10);
    const avatarUrl = this.generateAvatarUrl(createUserData.name);

    const newUser = await this.prismaService.user.create({
      data: {
        ...createUserData,
        password: hashedPassword,
        avatarUrl,
      },
    });

    return plainToInstance(UserResponseDto, newUser);
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const allUsers = await this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(UserResponseDto, allUsers);
  }

  /**
   * Get public users (active, non-admin)
   * @returns Array of public users
   */
  async getPublicUsers(): Promise<PublicUserResponseDto[]> {
    const publicUsers = await this.prismaService.user.findMany({
      where: {
        accountStatus: AccountStatus.ACTIVE,
        role: { not: UserRole.ADMIN },
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lastSeen: true,
        score: true,
        avatarUrl: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(PublicUserResponseDto, publicUsers);
  }

  /**
   * Find user by email
   * @param emailAddress - Email address to search for
   * @returns User with email
   * @throws NotFoundException if user not found
   */
  async findUserByEmail(emailAddress: string) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email: emailAddress },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with email ${emailAddress} not found`);
    }

    return foundUser;
  }

  /**
   * Find user by ID
   * @param userId - User ID to find
   * @returns User details
   * @throws NotFoundException if user not found
   */
  async findUserById(userId: number): Promise<UserResponseDto> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return plainToInstance(UserResponseDto, foundUser);
  }

  /**
   * Find public user by ID
   * @param userId - User ID to find
   * @returns Public user details
   * @throws NotFoundException if user not found
   */
  async findPublicUserById(userId: number): Promise<PublicUserResponseDto> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lastSeen: true,
        score: true,
        avatarUrl: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return plainToInstance(PublicUserResponseDto, foundUser);
  }

  /**
   * Update user
   * @param userId - User ID to update
   * @param updateData - Updated user data
   * @returns Updated user
   * @throws NotFoundException if user not found
   * @throws ConflictException if email already exists
   */
  async updateUser(
    userId: number,
    updateData: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateData.email) {
      const userWithSameEmail = await this.findUserByEmail(updateData.email);
      if (userWithSameEmail && userWithSameEmail.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatePayload: Prisma.UserUpdateInput = { ...updateData };

    if (updateData.password) {
      updatePayload.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.name && updateData.name !== existingUser.name) {
      updatePayload.avatarUrl = this.generateAvatarUrl(updateData.name);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    return plainToInstance(UserResponseDto, updatedUser);
  }

  /**
   * Soft delete user
   * @param userId - User ID to delete
   * @returns Deleted user
   * @throws NotFoundException if user not found
   */
  async softDeleteUser(userId: number): Promise<UserResponseDto> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const deletedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { accountStatus: AccountStatus.DELETED },
    });

    return plainToInstance(UserResponseDto, deletedUser);
  }

  /**
   * Update account status
   * @param userId - User ID to update
   * @param newStatus - New account status
   * @returns Updated user
   * @throws NotFoundException if user not found
   * @throws BadRequestException if trying to set DELETED status
   */
  async updateAccountStatus(
    userId: number,
    newStatus: AccountStatus,
  ): Promise<UserResponseDto> {
    if (newStatus === AccountStatus.DELETED) {
      throw new BadRequestException(
        'Cannot set status to DELETED. Use softDelete instead.',
      );
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { accountStatus: newStatus },
    });

    return plainToInstance(UserResponseDto, updatedUser);
  }

  /**
   * Update user status
   * @param userId - User ID to update
   * @param newStatus - New user status
   * @returns Updated user
   */
  async updateUserStatus(userId: number, newStatus: UserStatus) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
  }

  /**
   * Update user profile
   * @param userId - User ID to update
   * @param profileData - Profile data to update
   * @returns Updated public user
   * @throws NotFoundException if user not found
   * @throws ConflictException if email already exists
   */
  async updateUserProfile(
    userId: number,
    profileData: UpdateProfileDto,
  ): Promise<PublicUserResponseDto> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatePayload: Prisma.UserUpdateInput = {};

    if (profileData.name) {
      updatePayload.name = profileData.name;
      updatePayload.avatarUrl = this.generateAvatarUrl(profileData.name);
    }

    if (profileData.email) {
      const userWithSameEmail = await this.findUserByEmail(profileData.email);
      if (userWithSameEmail && userWithSameEmail.id !== userId) {
        throw new ConflictException('Email already in use');
      }
      updatePayload.email = profileData.email;
    }

    if (profileData.password) {
      updatePayload.password = await bcrypt.hash(profileData.password, 10);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    return plainToInstance(PublicUserResponseDto, updatedUser);
  }
}
