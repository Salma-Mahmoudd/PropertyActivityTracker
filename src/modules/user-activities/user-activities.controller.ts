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
import { UserActivitiesService } from './user-activities.service';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UserActivityResponseDto } from './dto/user-activity-response.dto';

@ApiTags('UserActivities')
@Controller('user-activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UserActivitiesController {
  constructor(private readonly uaService: UserActivitiesService) {}

  @Post()
  @ApiOkResponse({ type: UserActivityResponseDto })
  create(@CurrentUser() user: User, @Body() dto: CreateUserActivityDto) {
    return this.uaService.create(user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: UserActivityResponseDto, isArray: true })
  findAll(@CurrentUser() user: User) {
    return this.uaService.findAllByUser(user.id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserActivityResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserActivityDto) {
    return this.uaService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserActivityResponseDto })
  remove(@Param('id') id: string) {
    return this.uaService.remove(+id);
  }
}
