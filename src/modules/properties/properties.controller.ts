import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PropertyResponseDto } from './dto/property-response.dto';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiCreatedResponse({
    type: PropertyResponseDto,
    description: 'Property created successfully',
  })
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.createProperty(createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiOkResponse({
    type: PropertyResponseDto,
    isArray: true,
    description: 'List of all properties',
  })
  async getAllProperties(): Promise<PropertyResponseDto[]> {
    return this.propertiesService.getAllProperties();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'number' })
  @ApiOkResponse({
    type: PropertyResponseDto,
    description: 'Property found successfully',
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  async getPropertyById(
    @Param('id', ParseIntPipe) propertyId: number,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.getPropertyById(propertyId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'number' })
  @ApiOkResponse({
    type: PropertyResponseDto,
    description: 'Property updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  async updateProperty(
    @Param('id', ParseIntPipe) propertyId: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.updateProperty(propertyId, updatePropertyDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID', type: 'number' })
  @ApiOkResponse({
    type: PropertyResponseDto,
    description: 'Property deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  async deleteProperty(
    @Param('id', ParseIntPipe) propertyId: number,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.deleteProperty(propertyId);
  }
}
