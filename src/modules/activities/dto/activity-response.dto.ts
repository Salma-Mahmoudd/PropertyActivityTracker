import { ApiProperty } from '@nestjs/swagger';

export class ActivityResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the activity type',
  })
  readonly id: number;

  @ApiProperty({
    example: 'visit',
    description:
      'Name of the activity type (e.g., visit, call, inspection, follow-up, note)',
  })
  readonly name: string;

  @ApiProperty({
    example: 10,
    description:
      'Weight score for the activity - higher weight means more points',
  })
  readonly weight: number;

  @ApiProperty({
    example: 'https://example.com/icons/visit.png',
    required: false,
    description: 'URL or path to the activity icon',
  })
  readonly icon?: string;

  @ApiProperty({
    example: 'Sales representative visited the property in person',
    required: false,
    description: 'Detailed description of what this activity involves',
  })
  readonly description?: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the activity type was created',
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the activity type was last updated',
  })
  readonly updatedAt: Date;
}
