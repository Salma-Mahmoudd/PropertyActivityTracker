import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { plainToInstance } from 'class-transformer';
import { PropertyResponseDto } from './dto/property-response.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePropertyDto): Promise<PropertyResponseDto> {
    const property = await this.prisma.property.create({ data });
    return plainToInstance(PropertyResponseDto, property);
  }

  async findAll(): Promise<PropertyResponseDto[]> {
    const properties = await this.prisma.property.findMany();
    return plainToInstance(PropertyResponseDto, properties);
  }

  async findOne(id: number): Promise<PropertyResponseDto> {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property)
      throw new NotFoundException(`Property with ID ${id} not found`);
    return plainToInstance(PropertyResponseDto, property);
  }

  async update(
    id: number,
    data: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    await this.findOne(id);
    const updated = await this.prisma.property.update({
      where: { id },
      data,
    });
    return plainToInstance(PropertyResponseDto, updated);
  }

  async remove(id: number): Promise<PropertyResponseDto> {
    await this.findOne(id);
    const deleted = await this.prisma.property.delete({ where: { id } });
    return plainToInstance(PropertyResponseDto, deleted);
  }
}
