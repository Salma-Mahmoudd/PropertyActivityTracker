import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { UserRole, AccountStatus, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user (max 50 characters)',
    maxLength: 50,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  readonly name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Password (min 8 characters)',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password: string;

  @ApiProperty({
    example: 'SALES_REP',
    enum: UserRole,
    default: UserRole.SALES_REP,
    required: false,
    description: 'User role in the system',
  })
  @IsString({ message: 'Role must be a string' })
  @IsOptional()
  readonly role?: UserRole;

  @ApiProperty({
    example: 'ACTIVE',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    required: false,
    description: 'Account status of the user',
  })
  @IsString({ message: 'Account status must be a string' })
  @IsOptional()
  readonly accountStatus?: AccountStatus;

  @ApiProperty({
    example: 0,
    default: 0,
    required: false,
    description: 'User score (default: 0)',
  })
  @IsOptional()
  readonly score?: number;

  @ApiProperty({
    required: false,
    description: 'Last seen timestamp',
  })
  @IsOptional()
  readonly lastSeen?: Date;

  @ApiProperty({
    required: false,
    description: 'User status',
  })
  @IsOptional()
  readonly status?: UserStatus;
}
