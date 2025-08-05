import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserActivityDto {
  @ApiProperty({
    example: 2,
    description: 'ID of the property related to the activity',
  })
  @IsInt()
  @Min(1)
  propertyId: number;

  @ApiProperty({ example: 3, description: 'ID of the activity type' })
  @IsInt()
  @Min(1)
  activityId: number;

  @ApiProperty({
    example: 'Discussed price negotiation',
    required: false,
    description: 'Optional note describing details about the activity',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
