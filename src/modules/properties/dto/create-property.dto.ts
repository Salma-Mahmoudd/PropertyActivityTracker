import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Sunset Villa',
    required: false,
    description: 'Optional property name (max 100 characters)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Property name must be a string' })
  @MaxLength(100, { message: 'Property name cannot exceed 100 characters' })
  readonly name?: string;

  @ApiProperty({
    example: 31.2357,
    description: 'Latitude coordinate of the property location (-90 to 90)',
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty({ message: 'Latitude is required' })
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  readonly latitude: number;

  @ApiProperty({
    example: 30.0444,
    description: 'Longitude coordinate of the property location (-180 to 180)',
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty({ message: 'Longitude is required' })
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  readonly longitude: number;

  @ApiProperty({
    example: '123 Main Street, Downtown Cairo, Egypt',
    description: 'Full address of the property (max 255 characters)',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address cannot exceed 255 characters' })
  readonly address: string;
}
