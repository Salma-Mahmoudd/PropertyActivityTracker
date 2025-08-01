import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Property A',
    required: false,
    description: 'Optional property name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 31.2357,
    description: 'Latitude of the property location',
  })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({
    example: 30.0444,
    description: 'Longitude of the property location',
  })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: '123 Main St, Cairo, Egypt',
    description: 'Full address of the property',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;
}
