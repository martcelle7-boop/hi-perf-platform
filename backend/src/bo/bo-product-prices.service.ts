import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminNetworksService } from '../admin/admin-networks.service';
import { ProductPrice } from '@prisma/client';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';

@Injectable()
export class BoProductPricesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminNetworksService: AdminNetworksService,
  ) {}

  async createPrice(
    productId: number,
    createProductPriceDto: CreateProductPriceDto,
  ): Promise<ProductPrice> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Only NORMAL type products can have custom pricing
      if (product.type !== 'NORMAL') {
        throw new BadRequestException(
          'Only NORMAL type products can have custom pricing',
        );
      }

      const network = await this.prisma.network.findUnique({
        where: { id: createProductPriceDto.networkId },
      });

      if (!network) {
        throw new NotFoundException(
          `Network with ID ${createProductPriceDto.networkId} not found`,
        );
      }

      // Check if price already exists
      const existing = await this.prisma.productPrice.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId: createProductPriceDto.networkId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Price already exists for this product-network combination',
        );
      }

      return await this.prisma.productPrice.create({
        data: {
          productId,
          networkId: createProductPriceDto.networkId,
          amount: new Decimal(createProductPriceDto.amount),
        },
        include: {
          network: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create product price');
    }
  }

  async getPrice(productId: number, networkId: number): Promise<ProductPrice> {
    try {
      const price = await this.prisma.productPrice.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
        include: {
          network: true,
        },
      });

      if (!price) {
        // Check if we can inherit from parent network
        const inheritedPrice = await this.getInheritedPrice(
          productId,
          networkId,
        );
        if (inheritedPrice) {
          return inheritedPrice;
        }

        throw new NotFoundException(
          `Price not found for product ${productId} in network ${networkId}`,
        );
      }

      return price;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch product price');
    }
  }

  async getPricesForProduct(productId: number): Promise<ProductPrice[]> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return await this.prisma.productPrice.findMany({
        where: { productId },
        include: {
          network: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch product prices');
    }
  }

  async updatePrice(
    productId: number,
    networkId: number,
    updateProductPriceDto: UpdateProductPriceDto,
  ): Promise<ProductPrice> {
    try {
      const price = await this.prisma.productPrice.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
      });

      if (!price) {
        throw new NotFoundException(
          `Price not found for product ${productId} in network ${networkId}`,
        );
      }

      const updateData: any = {};
      if (updateProductPriceDto.amount) {
        updateData.amount = new Decimal(updateProductPriceDto.amount);
      }

      return await this.prisma.productPrice.update({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
        data: updateData,
        include: {
          network: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update product price');
    }
  }

  async deletePrice(
    productId: number,
    networkId: number,
  ): Promise<ProductPrice> {
    try {
      const price = await this.prisma.productPrice.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
      });

      if (!price) {
        throw new NotFoundException(
          `Price not found for product ${productId} in network ${networkId}`,
        );
      }

      return await this.prisma.productPrice.delete({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
        include: {
          network: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete product price');
    }
  }

  /**
   * Get price for network with inheritance from parent networks
   */
  private async getInheritedPrice(
    productId: number,
    networkId: number,
  ): Promise<ProductPrice | null> {
    try {
      const hierarchy = await this.adminNetworksService.getNetworkHierarchy(
        networkId,
      );

      // Climb the hierarchy to find inherited price
      for (const network of hierarchy) {
        const price = await this.prisma.productPrice.findUnique({
          where: {
            productId_networkId: {
              productId,
              networkId: network.id,
            },
          },
          include: {
            network: true,
          },
        });

        if (price) {
          return price;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}

// Import Decimal for Prisma Decimal type
const Decimal = require('decimal.js');
