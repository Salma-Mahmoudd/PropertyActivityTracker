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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyResponseDto } from './dto/property-response.dto';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOkResponse({ type: PropertyResponseDto })
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: PropertyResponseDto, isArray: true })
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PropertyResponseDto })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOkResponse({ type: PropertyResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOkResponse({ type: PropertyResponseDto })
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(+id);
  }
}
