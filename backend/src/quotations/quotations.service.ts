import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { Prisma } from '@prisma/client';
import {
  CreateQuotationItemDto,
  UpdateQuotationStatusDto,
  UpdateQuotationItemDto,
} from './dto';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Get or create the current DRAFT quotation for a user
   */
  async getCurrentQuotation(userId: number, networkId?: number) {
    // Get user to verify they exist and get clientId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clientId: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (!user.clientId) {
      throw new BadRequestException('User does not belong to any client');
    }

    // Find existing DRAFT quotation (for given networkId if provided)
    let quotation = await this.prisma.quotation.findFirst({
      where: {
        userId,
        status: 'DRAFT',
        ...(networkId && { networkId }),
      },
      include: {
        items: {
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

    // If no DRAFT quotation exists, create one
    if (!quotation) {
      const resolvedNetworkId = networkId || 1; // Default to network 1
      quotation = await this.prisma.quotation.create({
        data: {
          userId,
          clientId: user.clientId,
          networkId: resolvedNetworkId,
          status: 'DRAFT',
        },
        include: {
          items: {
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
    }

    // Compute total
    const total = quotation.items.reduce((sum, item) => {
      if (item.unitPrice === null) return sum;
      return sum + item.unitPrice.toNumber() * item.quantity;
    }, 0);

    return {
      ...quotation,
      totalAmount: new Prisma.Decimal(total),
    };
  }

  /**
   * Get all quotations for a user (READ-ONLY)
   */
  async getUserQuotations(userId: number) {
    const quotations = await this.prisma.quotation.findMany({
      where: { userId },
      include: {
        items: {
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
      orderBy: { createdAt: 'desc' },
    });

    return quotations.map(q => ({
      ...q,
      totalAmount: q.items.reduce((sum, item) => {
        if (item.unitPrice === null) return sum;
        return sum + item.unitPrice.toNumber() * item.quantity;
      }, 0),
    }));
  }

  /**
   * Get a quotation by ID (verify ownership or ADMIN/BO role)
   */
  async getQuotationById(quotationId: number, userId: number, userRole?: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: {
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

    if (!quotation) {
      throw new NotFoundException(`Quotation ${quotationId} not found`);
    }

    // Only owner, ADMIN, or BO can view
    if (quotation.userId !== userId && !['ADMIN', 'BO'].includes(userRole || '')) {
      throw new ForbiddenException('You cannot view this quotation');
    }

    const total = quotation.items.reduce((sum, item) => {
      if (item.unitPrice === null) return sum;
      return sum + item.unitPrice.toNumber() * item.quantity;
    }, 0);

    return {
      ...quotation,
      totalAmount: new Prisma.Decimal(total),
    };
  }

  /**
   * Add an item to the current DRAFT quotation
   * Snapshot product name and code for immutability
   * If product has no effective price, unitPrice = null
   */
  async addItemToQuotation(
    userId: number,
    dto: CreateQuotationItemDto,
    networkId: number,
  ) {
    // Get current quotation
    const quotation = await this.getCurrentQuotation(userId, networkId);

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product ${dto.productId} not found`,
      );
    }

    // Try to get effective price
    let unitPrice: Prisma.Decimal | null = null;
    try {
      const effectivePrice = await this.pricingService.getEffectivePrice(
        dto.productId,
        networkId,
      );
      unitPrice = new Prisma.Decimal(effectivePrice.amount);
    } catch (error) {
      // Product not available in network or no price - allow null unitPrice
      console.warn(
        `No price found for product ${dto.productId} in network ${networkId}`,
      );
    }

    // Create quotation item with snapshot of product identifiers
    const item = await this.prisma.quotationItem.create({
      data: {
        quotationId: quotation.id,
        productId: dto.productId,
        productCode: product.code,
        productName: product.name,
        quantity: dto.quantity || 1,
        unitPrice,
        currency: 'EUR',
      },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    // Recompute quotation total
    await this.recomputeQuotationTotal(quotation.id);

    return item;
  }

  /**
   * Update quantity of an item in DRAFT quotation
   */
  async updateItemQuantity(
    userId: number,
    itemId: number,
    dto: UpdateQuotationItemDto,
  ) {
    // Get the item
    const item = await this.prisma.quotationItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    // Verify quotation ownership and is DRAFT
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: item.quotationId },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation not found`);
    }

    if (quotation.userId !== userId) {
      throw new ForbiddenException('Item does not belong to your quotation');
    }

    if (quotation.status !== 'DRAFT') {
      throw new BadRequestException('Cannot modify a non-DRAFT quotation');
    }

    // Update item
    const updated = await this.prisma.quotationItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    // Recompute quotation total
    await this.recomputeQuotationTotal(quotation.id);

    return updated;
  }

  /**
   * Remove an item from the current DRAFT quotation
   */
  async removeItemFromQuotation(userId: number, itemId: number) {
    // Get current quotation to verify ownership
    const quotation = await this.getCurrentQuotation(userId);

    // Verify item belongs to this quotation
    const item = await this.prisma.quotationItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    if (item.quotationId !== quotation.id) {
      throw new ForbiddenException('Item does not belong to your quotation');
    }

    // Delete the item
    await this.prisma.quotationItem.delete({
      where: { id: itemId },
    });

    // Recompute quotation total
    await this.recomputeQuotationTotal(quotation.id);

    return { success: true };
  }

  /**
   * Update quotation status
   */
  async updateQuotationStatus(
    userId: number,
    dto: UpdateQuotationStatusDto,
  ) {
    // Get current quotation
    const quotation = await this.getCurrentQuotation(userId);

    if (quotation.status !== 'DRAFT') {
      throw new BadRequestException(
        `Cannot update quotation status from ${quotation.status}`,
      );
    }

    // Update status
    const updated = await this.prisma.quotation.update({
      where: { id: quotation.id },
      data: { status: dto.status },
      include: {
        items: {
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

    return updated;
  }

  /**
   * Recompute and update the total amount for a quotation
   */
  private async recomputeQuotationTotal(quotationId: number) {
    const items = await this.prisma.quotationItem.findMany({
      where: { quotationId },
    });

    const total = items.reduce((sum, item) => {
      if (item.unitPrice === null) return sum;
      return sum + item.unitPrice.toNumber() * item.quantity;
    }, 0);

    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: { totalAmount: new Prisma.Decimal(total) },
    });
  }
}
