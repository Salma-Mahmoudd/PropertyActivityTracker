import { ApiProperty } from '@nestjs/swagger';

export class ActivityResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  weight: number;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
