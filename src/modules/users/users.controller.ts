import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountStatus } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOkResponse({ type: UserResponseDto })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('me')
  @ApiOkResponse({ type: PublicUserResponseDto })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me')
  @ApiOkResponse({ type: PublicUserResponseDto })
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findSafeById(user.id);
  }

  @Get('public/list')
  @ApiOkResponse({ type: PublicUserResponseDto, isArray: true })
  getPublicUsers() {
    return this.usersService.findAllPublic();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOkResponse({ type: UserResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOkResponse({ type: UserResponseDto })
  softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBody({
    description: 'Set account status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(AccountStatus) },
      },
      required: ['status'],
    },
  })
  setStatus(@Param('id') id: string, @Body('status') status: AccountStatus) {
    return this.usersService.setAccountStatus(+id, status);
  }
}
