import { ApiProperty } from '@nestjs/swagger';

export class PropertyResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ example: 31.2357 })
  latitude: number;

  @ApiProperty({ example: 30.0444 })
  longitude: number;

  @ApiProperty({ example: '123 Main St, Cairo, Egypt' })
  address: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
