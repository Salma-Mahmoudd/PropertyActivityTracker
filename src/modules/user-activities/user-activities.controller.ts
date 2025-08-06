import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';
import { UserActivityResponseDto } from './dto/user-activity-response.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('UserActivities')
@Controller('user-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: UserActivityResponseDto, isArray: true })
  @ApiQuery({ name: 'afterTimestamp', required: false, type: String })
  findAllActivities(@Query('afterTimestamp') afterTimestamp?: string) {
    if (afterTimestamp) {
      return this.uaService.findAllAfterTimestamp(new Date(afterTimestamp));
    }
    return this.uaService.findAll();
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
