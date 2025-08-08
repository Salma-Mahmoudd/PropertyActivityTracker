import { ApiProperty } from '@nestjs/swagger';

export class PropertyResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the property',
  })
  readonly id: number;

  @ApiProperty({
    example: 'Sunset Villa',
    required: false,
    description: 'Property name (optional)',
  })
  readonly name?: string;

  @ApiProperty({
    example: 31.2357,
    description: 'Latitude coordinate of the property location',
  })
  readonly latitude: number;

  @ApiProperty({
    example: 30.0444,
    description: 'Longitude coordinate of the property location',
  })
  readonly longitude: number;

  @ApiProperty({
    example: '123 Main Street, Downtown Cairo, Egypt',
    description: 'Full address of the property',
  })
  readonly address: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the property was created',
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the property was last updated',
  })
  readonly updatedAt: Date;
}
