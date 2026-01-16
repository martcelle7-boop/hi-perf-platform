import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateBoProductDto } from './dto/create-bo-product.dto';
import { UpdateBoProductDto } from './dto/update-bo-product.dto';

@Injectable()
export class BoProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoProductDto: CreateBoProductDto): Promise<Product> {
    try {
      // Check if code is unique
      const existing = await this.prisma.product.findUnique({
        where: { code: createBoProductDto.code },
      });

      if (existing) {
        throw new ConflictException('Product code already exists');
      }

      return await this.prisma.product.create({
        data: {
          code: createBoProductDto.code,
          name: createBoProductDto.name,
          type: createBoProductDto.type as any,
          publicPrice: createBoProductDto.publicPrice
            ? new Decimal(createBoProductDto.publicPrice)
            : undefined,
          priceDescription: createBoProductDto.priceDescription,
        },
        include: {
          productNetworks: {
            include: {
              network: true,
            },
          },
          productPrices: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        include: {
          productNetworks: {
            include: {
              network: true,
            },
          },
          productPrices: {
            include: {
              network: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          productNetworks: {
            include: {
              network: true,
            },
          },
          productPrices: {
            include: {
              network: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch product');
    }
  }

  async update(
    id: number,
    updateBoProductDto: UpdateBoProductDto,
  ): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Check if code is being changed and is unique
      if (updateBoProductDto.code && updateBoProductDto.code !== product.code) {
        const existing = await this.prisma.product.findUnique({
          where: { code: updateBoProductDto.code },
        });

        if (existing) {
          throw new ConflictException('Product code already exists');
        }
      }

      const updateData: any = {};
      if (updateBoProductDto.code) updateData.code = updateBoProductDto.code;
      if (updateBoProductDto.name) updateData.name = updateBoProductDto.name;
      if (updateBoProductDto.type) updateData.type = updateBoProductDto.type as any;
      if (updateBoProductDto.publicPrice)
        updateData.publicPrice = new Decimal(updateBoProductDto.publicPrice);
      if (updateBoProductDto.priceDescription)
        updateData.priceDescription = updateBoProductDto.priceDescription;
      if (updateBoProductDto.isActive !== undefined)
        updateData.isActive = updateBoProductDto.isActive;

      return await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          productNetworks: {
            include: {
              network: true,
            },
          },
          productPrices: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: number): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return await this.prisma.product.delete({
        where: { id },
        include: {
          productNetworks: {
            include: {
              network: true,
            },
          },
          productPrices: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete product');
    }
  }

  /**
   * Find products by type
   */
  async findByType(type: string): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: { type: type as any },
        include: {
          productNetworks: {
            include: {
              network: true,
            },
          },
          productPrices: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch products by type');
    }
  }
}

// Import Decimal for Prisma Decimal type
const Decimal = require('decimal.js');
