import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({
    example: 'visit',
    description:
      'Unique name of the activity type (e.g., visit, call, inspection, follow-up, note)',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Activity name is required' })
  @IsString({ message: 'Activity name must be a string' })
  @MaxLength(100, { message: 'Activity name cannot exceed 100 characters' })
  readonly name: string;

  @ApiProperty({
    example: 10,
    description:
      'Weight score for the activity (1-100) - higher weight means more points',
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'Weight must be an integer' })
  @Min(1, { message: 'Weight must be at least 1' })
  readonly weight: number;

  @ApiProperty({
    example: 'https://example.com/icons/visit.png',
    required: false,
    description: 'URL or path to the activity icon (optional)',
  })
  @IsOptional()
  @IsString({ message: 'Icon must be a string' })
  readonly icon?: string;

  @ApiProperty({
    example: 'Sales representative visited the property in person',
    required: false,
    description:
      'Detailed description of what this activity involves (optional)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  readonly description?: string;
}
