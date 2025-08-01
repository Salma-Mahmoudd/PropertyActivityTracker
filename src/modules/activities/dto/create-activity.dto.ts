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
  @ApiProperty({ example: 'Visit', description: 'Name of the activity' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 10, description: 'Weight score for the activity' })
  @IsInt()
  @Min(1)
  weight: number;

  @ApiProperty({
    example: 'visit-icon.png',
    required: false,
    description: 'Optional icon filename or URL',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: 'Sales rep visited the property',
    required: false,
    description: 'Detailed description of the activity',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
