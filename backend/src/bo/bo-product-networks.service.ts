import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductNetwork } from '@prisma/client';
import { AssignProductNetworkDto } from './dto/assign-product-network.dto';

@Injectable()
export class BoProductNetworksService {
  constructor(private readonly prisma: PrismaService) {}

  async assignProductToNetwork(
    productId: number,
    assignProductNetworkDto: AssignProductNetworkDto,
  ): Promise<ProductNetwork> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const network = await this.prisma.network.findUnique({
        where: { id: assignProductNetworkDto.networkId },
      });

      if (!network) {
        throw new NotFoundException(
          `Network with ID ${assignProductNetworkDto.networkId} not found`,
        );
      }

      // Check if already assigned
      const existing = await this.prisma.productNetwork.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId: assignProductNetworkDto.networkId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Product already visible in this network',
        );
      }

      return await this.prisma.productNetwork.create({
        data: {
          productId,
          networkId: assignProductNetworkDto.networkId,
        },
        include: {
          product: true,
          network: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to assign product to network',
      );
    }
  }

  async removeProductFromNetwork(
    productId: number,
    networkId: number,
  ): Promise<ProductNetwork> {
    try {
      const productNetwork = await this.prisma.productNetwork.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
      });

      if (!productNetwork) {
        throw new NotFoundException(
          `Product-Network assignment not found`,
        );
      }

      return await this.prisma.productNetwork.delete({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
        include: {
          product: true,
          network: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'Failed to remove product from network',
      );
    }
  }

  async getProductNetworks(productId: number): Promise<ProductNetwork[]> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return await this.prisma.productNetwork.findMany({
        where: { productId },
        include: {
          network: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'Failed to fetch product networks',
      );
    }
  }
}
