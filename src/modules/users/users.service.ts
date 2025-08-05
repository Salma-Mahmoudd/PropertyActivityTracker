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
import { AccountStatus, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        accountStatus: { not: AccountStatus.DELETED },
      },
    });
    if (existing) throw new ConflictException('Email already in use');
    data.password = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({ data });
    return plainToInstance(UserResponseDto, user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserResponseDto, users);
  }

  async findAllPublic(): Promise<PublicUserResponseDto[]> {
    const users = await this.prisma.user.findMany({
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
      },
    });
    return plainToInstance(PublicUserResponseDto, users);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return plainToInstance(UserResponseDto, user);
  }

  async findSafeById(id: number): Promise<PublicUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        // accountStatus: AccountStatus.ACTIVE,
        // role: { not: UserRole.ADMIN },
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lastSeen: true,
        score: true,
      },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return plainToInstance(PublicUserResponseDto, user);
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id, role: { not: UserRole.ADMIN } },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== id)
        throw new ConflictException('Email already in use');
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updatedUser = await this.prisma.user.update({ where: { id }, data });
    return plainToInstance(UserResponseDto, updatedUser);
  }

  async softDelete(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id, role: { not: UserRole.ADMIN } },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: AccountStatus.DELETED },
    });
    return plainToInstance(UserResponseDto, deletedUser);
  }

  async setAccountStatus(
    id: number,
    status: AccountStatus,
  ): Promise<UserResponseDto> {
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    const user = await this.prisma.user.findUnique({
      where: { id, role: { not: UserRole.ADMIN } },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: status },
    });
    return plainToInstance(UserResponseDto, updatedUser);
  }

  async updateProfile(
    id: number,
    dto: UpdateProfileDto,
  ): Promise<PublicUserResponseDto> {
    const data: Partial<UpdateProfileDto> = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id)
        throw new ConflictException('Email already in use');
      data.email = dto.email;
    }
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    const updatedUser = await this.prisma.user.update({ where: { id }, data });
    return plainToInstance(PublicUserResponseDto, updatedUser);
  }
}
