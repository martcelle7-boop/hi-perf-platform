import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';

type PriceKind = 'NUMERIC' | 'TEXT' | 'ON_REQUEST';

export interface CatalogPriceDto {
  kind: PriceKind;
  amount?: string;
  currency?: string;
  sourceNetworkId?: number;
  isInherited?: boolean;
  note?: string | null;
}

export interface CatalogProductDto {
  id: number;
  code: string;
  name: string;
  type: 'GENERIC' | 'NORMAL' | 'PARTNER';
  description?: string | null;
  brand?: string | null;
  unit?: string | null;
  priceDescription?: string | null;
  longDescription?: string | null;
  shippingFee?: string | null;
  activationService?: boolean;
  externalUrl?: string | null;
  partnerCode?: string | null;
  price: CatalogPriceDto;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogFilters {
  q?: string; // Search query
  networkId?: number;
  type?: 'GENERIC' | 'NORMAL' | 'PARTNER';
  skip?: number;
  take?: number;
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Get catalog with effective pricing for a user in their primary network
   * Supports multi-network pricing hierarchy (MIN price across allowed networks)
   */
  async getCatalog(
    userId: number,
    filters: CatalogFilters,
  ): Promise<{ products: CatalogProductDto[]; total: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clientId: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const primaryNetworkId = filters.networkId || user.networkId;
    if (!primaryNetworkId) {
      throw new NotFoundException(
        'User has no primary network and no networkId provided',
      );
    }

    // Verify user has access to this network (via ClientNetwork)
    if (user.clientId) {
      const hasAccess = await this.prisma.clientNetwork.findUnique({
        where: {
          clientId_networkId: {
            clientId: user.clientId,
            networkId: primaryNetworkId,
          },
        },
      });

      if (!hasAccess) {
        throw new NotFoundException(
          `User does not have access to network ${primaryNetworkId}`,
        );
      }
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      productNetworks: {
        some: { networkId: primaryNetworkId },
      },
    };

    if (filters.type) {
      where.type = filters.type as any;
    }

    if (filters.q) {
      where.OR = [
        { code: { contains: filters.q, mode: 'insensitive' } },
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const skip = filters.skip || 0;
    const take = filters.take || 50;

    // Fetch products
    const products = await this.prisma.product.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        description: true,
        brand: true,
        unit: true,
        publicPrice: true,
        isPublicPriceTTC: true,
        priceDescription: true,
        longDescription: true,
        shippingFee: true,
        activationService: true,
        externalUrl: true,
        partnerCode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include ProductNetwork to verify visibility
        productNetworks: {
          where: { networkId: primaryNetworkId },
          select: { id: true },
        },
      },
    });

    // Count total
    const total = await this.prisma.product.count({ where });

    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const price = await this.resolvePrice(product, primaryNetworkId);

        return {
          id: product.id,
          code: product.code,
          name: product.name,
          type: product.type,
          description: product.description,
          brand: product.brand,
          unit: product.unit,
          priceDescription: product.priceDescription,
          longDescription: product.longDescription,
          shippingFee: product.shippingFee?.toFixed(2) ?? null,
          activationService: product.activationService,
          externalUrl: product.externalUrl,
          partnerCode: product.partnerCode,
          price,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        } satisfies CatalogProductDto;
      }),
    );

    return {
      products: enrichedProducts,
      total,
    };
  }

  /**
   * Get single product detail with effective pricing
   */
  async getProductDetail(
    userId: number,
    productId: number,
    networkId?: number,
  ): Promise<CatalogProductDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clientId: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const primaryNetworkId = networkId || user.networkId;
    if (!primaryNetworkId) {
      throw new NotFoundException(
        'User has no primary network and no networkId provided',
      );
    }

    // Fetch product
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        description: true,
        unit: true,
        publicPrice: true,
        isPublicPriceTTC: true,
        priceDescription: true,
        longDescription: true,
        shippingFee: true,
        activationService: true,
        externalUrl: true,
        partnerCode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const price = await this.resolvePrice(product, primaryNetworkId);

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      type: product.type,
      description: product.description,
      unit: product.unit,
      priceDescription: product.priceDescription,
      longDescription: product.longDescription,
      shippingFee: product.shippingFee?.toFixed(2) ?? null,
      activationService: product.activationService,
      externalUrl: product.externalUrl,
      partnerCode: product.partnerCode,
      price,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    } satisfies CatalogProductDto;
  }

  /**
   * Get effective price for a product in a network (with inheritance)
   * Delegates to PricingService for hierarchy traversal
   */
  private async resolvePrice(
    product: {
      id: number;
      type: 'GENERIC' | 'NORMAL' | 'PARTNER';
      publicPrice: Prisma.Decimal | null;
      priceDescription: string | null;
    },
    networkId: number,
  ): Promise<CatalogPriceDto> {
    if (product.type === 'NORMAL') {
      try {
        const effective = await this.pricingService.getEffectivePrice(
          product.id,
          networkId,
        );
        return {
          kind: 'NUMERIC',
          amount: effective.amount,
          currency: effective.currency,
          sourceNetworkId: effective.sourceNetworkId,
          isInherited: effective.isInherited,
          note: effective.note,
        };
      } catch {
        if (product.publicPrice) {
          return {
            kind: 'NUMERIC',
            amount: product.publicPrice.toFixed(2),
            currency: 'EUR',
            sourceNetworkId: networkId,
            isInherited: false,
          };
        }
        return { kind: 'ON_REQUEST' };
      }
    }

    if (product.type === 'PARTNER') {
      if (product.priceDescription) {
        return { kind: 'TEXT', note: product.priceDescription };
      }
      if (product.publicPrice) {
        return {
          kind: 'NUMERIC',
          amount: product.publicPrice.toFixed(2),
          currency: 'EUR',
          sourceNetworkId: networkId,
          isInherited: false,
        };
      }
      return { kind: 'ON_REQUEST' };
    }

    // GENERIC products may carry a fallback price; otherwise on-request
    if (product.publicPrice) {
      return {
        kind: 'NUMERIC',
        amount: product.publicPrice.toFixed(2),
        currency: 'EUR',
        sourceNetworkId: networkId,
        isInherited: false,
      };
    }

    return { kind: 'ON_REQUEST' };
  }

  /**
   * Search products across networks by term and type
   */
  async searchProducts(
    userId: number,
    searchTerm: string,
    type?: 'GENERIC' | 'NORMAL' | 'PARTNER',
    limit: number = 20,
  ): Promise<CatalogProductDto[]> {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const networkId = user.networkId;
    if (!networkId) {
      throw new NotFoundException('User has no primary network');
    }

    // Search
    const results = await this.getCatalog(userId, {
      q: searchTerm,
      networkId,
      type,
      take: limit,
    });

    return results.products;
  }
}
