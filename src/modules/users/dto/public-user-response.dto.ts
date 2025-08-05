import { ApiProperty } from '@nestjs/swagger';
import { UserStatusEnum } from '../../../common/enums/user.enum';

export class PublicUserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserStatusEnum })
  status: UserStatusEnum;

  @ApiProperty({ type: Date, required: false })
  lastSeen?: Date;

  @ApiProperty()
  score: number;
}
