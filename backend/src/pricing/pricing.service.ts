import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SetProductPriceDto } from './dto/set-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';

// === TYPE DEFINITIONS ===

export interface ProductPriceSummary {
  id: number;
  productId: number;
  networkId: number;
  currency: string;
  amount: string;
  isActive: boolean;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EffectivePrice {
  productId: number;
  requestedNetworkId: number;
  sourceNetworkId: number;
  isInherited: boolean;
  currency: string;
  amount: string;
  note: string | null;
  checkedNetworkIds: number[];
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  // === PRICE MANAGEMENT ===

  async setPrice(
    productId: number,
    networkId: number,
    dto: SetProductPriceDto,
  ): Promise<ProductPriceSummary> {
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

    // Verify product is visible in network (ProductNetwork exists)
    const productNetwork = await this.prisma.productNetwork.findUnique({
      where: {
        productId_networkId: {
          productId,
          networkId,
        },
      },
    });
    if (!productNetwork) {
      throw new ConflictException(
        `Product ${productId} is not available in Network ${networkId}. Add it first via products API.`,
      );
    }

    // Upsert the price
    try {
      const price = await this.prisma.productPrice.upsert({
        where: {
          productId_networkId: {
            productId,
            networkId,
          },
        },
        create: {
          productId,
          networkId,
          currency: dto.currency || 'EUR',
          amount: new Prisma.Decimal(dto.amount),
          isActive: dto.isActive ?? true,
          note: dto.note,
        },
        update: {
          currency: dto.currency,
          amount: new Prisma.Decimal(dto.amount),
          isActive: dto.isActive,
          note: dto.note,
        },
      });

      return this.formatPriceResponse(price);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Price already exists for Product ${productId} in Network ${networkId}`,
        );
      }
      throw error;
    }
  }

  async getExplicitPrice(
    productId: number,
    networkId: number,
  ): Promise<ProductPriceSummary> {
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
        `No explicit price found for Product ${productId} in Network ${networkId}`,
      );
    }

    return this.formatPriceResponse(price);
  }

  async getEffectivePrice(
    productId: number,
    networkId: number,
  ): Promise<EffectivePrice> {
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

    // Enforce product visibility in requested network
    const productNetwork = await this.prisma.productNetwork.findUnique({
      where: {
        productId_networkId: {
          productId,
          networkId,
        },
      },
    });
    if (!productNetwork) {
      throw new ConflictException(
        `Product ${productId} is not available in Network ${networkId}`,
      );
    }

    // Traverse hierarchy to find price
    const checkedNetworkIds: number[] = [];
    let currentNetworkId: number | null = networkId;

    while (currentNetworkId !== null) {
      checkedNetworkIds.push(currentNetworkId);

      const price = await this.prisma.productPrice.findUnique({
        where: {
          productId_networkId: {
            productId,
            networkId: currentNetworkId,
          },
        },
      });

      if (price && price.isActive) {
        // Found an active price
        const isInherited = currentNetworkId !== networkId;
        return {
          productId,
          requestedNetworkId: networkId,
          sourceNetworkId: currentNetworkId,
          isInherited,
          currency: price.currency,
          amount: price.amount.toFixed(2),
          note: price.note,
          checkedNetworkIds,
        };
      }

      // Move to parent network
      const currentNetwork = await this.prisma.network.findUnique({
        where: { id: currentNetworkId },
        select: { parentNetworkId: true },
      });

      currentNetworkId = currentNetwork?.parentNetworkId || null;
    }

    // No price found in hierarchy
    throw new NotFoundException(
      `No effective price found for Product ${productId} in Network ${networkId} or any parent network`,
    );
  }

  // === CONVENIENCE ENDPOINTS ===

  async listProductsWithPricesInNetwork(
    networkId: number,
  ): Promise<
    Array<{
      productId: number;
      productCode: string;
      productName: string;
      price: EffectivePrice;
    }>
  > {
    // Verify network exists
    const network = await this.prisma.network.findUnique({
      where: { id: networkId },
      include: {
        productNetworks: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!network) {
      throw new NotFoundException(`Network with ID ${networkId} not found`);
    }

    const results: Array<{
      productId: number;
      productCode: string;
      productName: string;
      price: EffectivePrice;
    }> = [];

    for (const pn of network.productNetworks) {
      try {
        const price = await this.getEffectivePrice(pn.product.id, networkId);
        results.push({
          productId: pn.product.id,
          productCode: pn.product.code,
          productName: pn.product.name,
          price,
        });
      } catch {
        // Product has no price in hierarchy - skip (do not include in results)
      }
    }

    return results;
  }

  // === HELPERS ===

  private formatPriceResponse(price: {
    id: number;
    productId: number;
    networkId: number;
    currency: string;
    amount: Prisma.Decimal;
    isActive: boolean;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ProductPriceSummary {
    return {
      id: price.id,
      productId: price.productId,
      networkId: price.networkId,
      currency: price.currency,
      amount: price.amount.toFixed(2),
      isActive: price.isActive,
      note: price.note,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    };
  }
}
