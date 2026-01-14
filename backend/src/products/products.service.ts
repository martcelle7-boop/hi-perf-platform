import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// === TYPE DEFINITIONS ===

export interface NetworkSummary {
  id: number;
  code: string;
  name: string;
  type: string;
}

export interface ProductWithNetworks {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  networks: NetworkSummary[];
}

interface FindAllQuery {
  q?: string;
  isActive?: boolean;
  networkId?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // === PRODUCT CRUD ===

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductWithNetworks> {
    try {
      const product = await this.prisma.product.create({
        data: {
          code: createProductDto.code,
          name: createProductDto.name,
          description: createProductDto.description,
        },
        include: {
          productNetworks: {
            include: {
              network: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      return this.formatProductResponse(product);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Product with code "${createProductDto.code}" already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(query?: FindAllQuery): Promise<ProductWithNetworks[]> {
    const where: Prisma.ProductWhereInput = {
      isActive: query?.isActive !== undefined ? query.isActive : true,
    };

    // Add search filter if provided
    if (query?.q) {
      where.OR = [
        { code: { contains: query.q, mode: 'insensitive' } },
        { name: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    // Add network filter if provided - filter at Prisma level
    if (query?.networkId) {
      where.productNetworks = {
        some: {
          networkId: query.networkId,
        },
      };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        productNetworks: {
          include: {
            network: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map((p) => this.formatProductResponse(p));
  }

  async findOne(id: number): Promise<ProductWithNetworks> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productNetworks: {
          include: {
            network: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.formatProductResponse(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductWithNetworks> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          name: updateProductDto.name,
          description: updateProductDto.description,
          isActive: updateProductDto.isActive,
        },
        include: {
          productNetworks: {
            include: {
              network: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      return this.formatProductResponse(product);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  // === PRODUCT ↔ NETWORK VISIBILITY ===

  async addNetwork(productId: number, networkId: number) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Verify network exists
    const network = await this.prisma.network.findUnique({
      where: { id: networkId },
    });
    if (!network) {
      throw new NotFoundException(`Network with ID ${networkId} not found`);
    }

    // Check if ProductNetwork relation already exists
    const existingProductNetwork =
      await this.prisma.productNetwork.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
      });

    if (existingProductNetwork) {
      throw new ConflictException(
        `Product ${productId} is already available in Network ${networkId}`,
      );
    }

    // Create the ProductNetwork relation
    return this.prisma.productNetwork.create({
      data: {
        productId,
        networkId,
      },
      include: {
        product: true,
        network: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async removeNetwork(productId: number, networkId: number): Promise<void> {
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
        `Product ${productId} is not available in Network ${networkId}`,
      );
    }

    await this.prisma.productNetwork.delete({
      where: {
        productId_networkId: {
          productId,
          networkId,
        },
      },
    });
  }

  async getNetworks(productId: number): Promise<NetworkSummary[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        productNetworks: {
          include: {
            network: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product.productNetworks.map((pn) => pn.network);
  }

  // === HELPERS ===

  private formatProductResponse(product: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    productNetworks: Array<{
      network: NetworkSummary;
    }>;
  }): ProductWithNetworks {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      networks: product.productNetworks.map((pn) => pn.network),
    };
  }
}
