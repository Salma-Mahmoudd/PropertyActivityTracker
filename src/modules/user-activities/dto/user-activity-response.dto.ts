import { ApiProperty } from '@nestjs/swagger';
import { ActivityResponseDto } from '../../activities/dto/activity-response.dto';
import { PropertyResponseDto } from '../../properties/dto/property-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class UserActivityResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the user activity',
  })
  readonly id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who performed the activity',
  })
  readonly userId: number;

  @ApiProperty({
    example: 2,
    description: 'ID of the property where the activity was performed',
  })
  readonly propertyId: number;

  @ApiProperty({
    example: 3,
    description: 'ID of the activity type performed',
  })
  readonly activityId: number;

  @ApiProperty({
    example: 'Discussed price negotiation with property owner',
    required: false,
    description: 'Optional note describing details about the activity',
  })
  readonly note?: string;

  @ApiProperty({
    example: 31.2357,
    required: false,
    description: 'Latitude coordinate where the activity occurred',
  })
  readonly latitude?: number;

  @ApiProperty({
    example: 30.0444,
    required: false,
    description: 'Longitude coordinate where the activity occurred',
  })
  readonly longitude?: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the activity was created',
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the activity was last updated',
  })
  readonly updatedAt: Date;

  @ApiProperty({
    type: () => UserResponseDto,
    required: false,
    description: 'User information who performed the activity',
  })
  readonly user?: UserResponseDto;

  @ApiProperty({
    type: () => PropertyResponseDto,
    required: false,
    description: 'Property information where the activity was performed',
  })
  readonly property?: PropertyResponseDto;

  @ApiProperty({
    type: () => ActivityResponseDto,
    required: false,
    description: 'Activity type information',
  })
  readonly activity?: ActivityResponseDto;
}
