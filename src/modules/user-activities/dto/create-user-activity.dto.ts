import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsNumber,
  Max,
} from 'class-validator';

export class CreateUserActivityDto {
  @ApiProperty({
    example: 2,
    description: 'ID of the property related to the activity',
    minimum: 1,
  })
  @IsInt({ message: 'Property ID must be an integer' })
  @Min(1, { message: 'Property ID must be at least 1' })
  readonly propertyId: number;

  @ApiProperty({
    example: 3,
    description:
      'ID of the activity type (visit, call, inspection, follow-up, note)',
    minimum: 1,
  })
  @IsInt({ message: 'Activity ID must be an integer' })
  @Min(1, { message: 'Activity ID must be at least 1' })
  readonly activityId: number;

  @ApiProperty({
    example: 'Discussed price negotiation with property owner',
    required: false,
    description:
      'Optional note describing details about the activity (min 1 character)',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  readonly note?: string;

  @ApiProperty({
    example: 31.2357,
    required: false,
    description: 'Latitude coordinate where the activity occurred (-90 to 90)',
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  readonly latitude?: number;

  @ApiProperty({
    example: 30.0444,
    required: false,
    description:
      'Longitude coordinate where the activity occurred (-180 to 180)',
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  readonly longitude?: number;
}
