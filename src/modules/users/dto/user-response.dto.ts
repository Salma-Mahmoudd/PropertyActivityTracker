import { ApiProperty } from '@nestjs/swagger';
import {
  UserRoleEnum,
  UserStatusEnum,
  AccountStatusEnum,
} from '../../../common/enums/user.enum';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserStatusEnum })
  status: UserStatusEnum;

  @ApiProperty({ enum: AccountStatusEnum })
  accountStatus: AccountStatusEnum;

  @ApiProperty({ enum: UserRoleEnum })
  role: UserRoleEnum;

  @ApiProperty()
  score: number;

  @ApiProperty({ type: Date, required: false })
  lastSeen?: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
