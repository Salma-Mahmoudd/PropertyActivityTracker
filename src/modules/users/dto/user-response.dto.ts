import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus, AccountStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the user',
  })
  readonly id: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  readonly name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  readonly email: string;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ONLINE,
    description: 'Current user status',
  })
  readonly status: UserStatus;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Account status of the user',
  })
  readonly accountStatus: AccountStatus;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.SALES_REP,
    description: 'User role in the system',
  })
  readonly role: UserRole;

  @ApiProperty({
    example: 150,
    description: 'User score',
  })
  readonly score: number;

  @ApiProperty({
    example: '+1234567890',
    required: false,
    description: 'Phone number of the user',
  })
  readonly phone?: string;

  @ApiProperty({
    example:
      'https://ui-avatars.com/api/?name=John+Doe&background=random&color=fff&size=200',
    description: 'Avatar URL for the user',
  })
  readonly avatarUrl: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    required: false,
    description: 'Last seen timestamp',
  })
  readonly lastSeen?: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    description: 'Timestamp when the user was created',
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    description: 'Timestamp when the user was last updated',
  })
  readonly updatedAt: Date;
}
