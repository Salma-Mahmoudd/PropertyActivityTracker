import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import {
  UserRoleEnum,
  AccountStatusEnum,
  UserStatusEnum,
} from '../../../common/enums/user.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'USER',
    enum: UserRoleEnum,
    default: UserRoleEnum.SALES_REP,
    required: false,
  })
  @IsString()
  @IsOptional()
  role?: UserRoleEnum;

  @ApiProperty({
    example: 'ACTIVE',
    enum: AccountStatusEnum,
    default: AccountStatusEnum.ACTIVE,
    required: false,
  })
  @IsString()
  @IsOptional()
  accountStatus?: AccountStatusEnum;

  @ApiProperty({ example: '20', default: 0, required: false })
  @IsOptional()
  score?: number;

  @IsOptional()
  lastSeen?: Date;

  @IsOptional()
  status?: UserStatusEnum;
}
