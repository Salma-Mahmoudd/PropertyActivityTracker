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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityResponseDto } from './dto/activity-response.dto';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOkResponse({ type: ActivityResponseDto })
  create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: ActivityResponseDto, isArray: true })
  findAll() {
    return this.activitiesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ActivityResponseDto })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOkResponse({ type: ActivityResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.update(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOkResponse({ type: ActivityResponseDto })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(+id);
  }
}
