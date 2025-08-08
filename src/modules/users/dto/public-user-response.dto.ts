import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class PublicUserResponseDto {
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
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    required: false,
    description: 'Last seen timestamp',
  })
  readonly lastSeen?: Date;

  @ApiProperty({
    example: 150,
    description: 'User score',
  })
  readonly score: number;

  @ApiProperty({
    example:
      'https://ui-avatars.com/api/?name=John+Doe&background=random&color=fff&size=200',
    description: 'Avatar URL for the user',
  })
  readonly avatarUrl: string;
}
