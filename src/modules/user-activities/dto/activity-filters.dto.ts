import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ActivityFiltersDto {
  @ApiProperty({
    required: false,
    description: 'Filter activities after this timestamp (ISO string)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsString()
  afterTimestamp?: string;

  @ApiProperty({
    required: false,
    description: 'Filter activities by user ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter activities by activity type ID',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  activityId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter activities from this date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter activities to this date (YYYY-MM-DD)',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
