import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { plainToInstance } from 'class-transformer';
import { PropertyResponseDto } from './dto/property-response.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create a new property
   * @param createPropertyData - Property data to create
   * @returns Created property
   */
  async createProperty(
    createPropertyData: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    const newProperty = await this.prismaService.property.create({
      data: createPropertyData,
    });
    return plainToInstance(PropertyResponseDto, newProperty);
  }

  /**
   * Get all properties
   * @returns Array of all properties
   */
  async getAllProperties(): Promise<PropertyResponseDto[]> {
    const allProperties = await this.prismaService.property.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(PropertyResponseDto, allProperties);
  }

  /**
   * Get property by ID
   * @param propertyId - Property ID to find
   * @returns Property with specified ID
   * @throws NotFoundException if property not found
   */
  async getPropertyById(propertyId: number): Promise<PropertyResponseDto> {
    const foundProperty = await this.prismaService.property.findUnique({
      where: { id: propertyId },
    });

    if (!foundProperty) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    return plainToInstance(PropertyResponseDto, foundProperty);
  }

  /**
   * Update property by ID
   * @param propertyId - Property ID to update
   * @param updatePropertyData - Updated property data
   * @returns Updated property
   * @throws NotFoundException if property not found
   */
  async updateProperty(
    propertyId: number,
    updatePropertyData: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    // Verify property exists
    await this.getPropertyById(propertyId);

    const updatedProperty = await this.prismaService.property.update({
      where: { id: propertyId },
      data: updatePropertyData,
    });

    return plainToInstance(PropertyResponseDto, updatedProperty);
  }

  /**
   * Delete property by ID
   * @param propertyId - Property ID to delete
   * @returns Deleted property
   * @throws NotFoundException if property not found
   */
  async deleteProperty(propertyId: number): Promise<PropertyResponseDto> {
    // Verify property exists
    await this.getPropertyById(propertyId);

    const deletedProperty = await this.prismaService.property.delete({
      where: { id: propertyId },
    });

    return plainToInstance(PropertyResponseDto, deletedProperty);
  }
}
