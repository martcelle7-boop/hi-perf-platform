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
  async getCurrentQuotation(userId: number) {
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

    // Find existing DRAFT quotation
    let quotation = await this.prisma.quotation.findUnique({
      where: {
        userId_status: {
          userId,
          status: 'DRAFT',
        },
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
      quotation = await this.prisma.quotation.create({
        data: {
          userId,
          clientId: user.clientId,
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
   * Add an item to the current DRAFT quotation
   * If product has no effective price, unitPrice = null
   */
  async addItemToQuotation(
    userId: number,
    dto: CreateQuotationItemDto,
    networkId: number,
  ) {
    // Get current quotation
    const quotation = await this.getCurrentQuotation(userId);

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

    // Create quotation item
    const item = await this.prisma.quotationItem.create({
      data: {
        quotationId: quotation.id,
        productId: dto.productId,
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
