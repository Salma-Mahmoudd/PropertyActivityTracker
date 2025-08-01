import { ApiProperty } from '@nestjs/swagger';
import { ActivityResponseDto } from '../../activities/dto/activity-response.dto';
import { PropertyResponseDto } from '../../properties/dto/property-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class UserActivityResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  propertyId: number;

  @ApiProperty()
  activityId: number;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: () => UserResponseDto, required: false })
  user?: UserResponseDto;

  @ApiProperty({ type: () => PropertyResponseDto, required: false })
  property?: PropertyResponseDto;

  @ApiProperty({ type: () => ActivityResponseDto, required: false })
  activity?: ActivityResponseDto;
}
