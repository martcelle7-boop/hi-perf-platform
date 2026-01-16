import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderDto, OrderLineDto, CreateOrderFromQuotationDto } from './dto/order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create order from quotation
   */
  async createFromQuotation(
    userId: number,
    dto: CreateOrderFromQuotationDto,
  ): Promise<OrderDto> {
    // Get quotation
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: dto.quotationId },
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
        user: {
          select: { id: true, clientId: true },
        },
      },
    });

    const existingOrder = await this.prisma.order.findUnique({
      where: { quotationId: dto.quotationId },
      select: { id: true },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation ${dto.quotationId} not found`);
    }

    // Verify ownership
    if (quotation.userId !== userId) {
      throw new BadRequestException(
        'Quotation does not belong to current user',
      );
    }

    // Verify quotation is accepted
    if (quotation.status !== 'ACCEPTED') {
      throw new ConflictException(
        `Quotation must be ACCEPTED to create order. Current status: ${quotation.status}`,
      );
    }

    if (existingOrder) {
      throw new ConflictException(
        `Quotation already has an order: ${existingOrder.id}`,
      );
    }

    if (!quotation.user.clientId) {
      throw new BadRequestException('User does not belong to any client');
    }

    // Generate unique order code
    const orderCode = await this.generateOrderCode();

    // Calculate total amount
    let totalAmount = new Prisma.Decimal(0);
    for (const item of quotation.items) {
      totalAmount = totalAmount.plus(
        new Prisma.Decimal(item.unitPrice || 0).times(item.quantity),
      );
    }

    // Create order with order lines
    const order = await this.prisma.order.create({
      data: {
        code: orderCode,
        userId,
        clientId: quotation.user.clientId,
        quotationId: quotation.id,
        status: 'PENDING_PAYMENT',
        totalAmount,
        currency: quotation.currency || 'EUR',
        lines: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            productCode: item.product.code,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice || new Prisma.Decimal(0),
            currency: quotation.currency || 'EUR',
            sourceNetworkId: quotation.networkId,
          })),
        },
      },
      include: {
        lines: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            providerSessionId: true,
          },
        },
      },
    });

    return this.formatOrderResponse(order);
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: number, skip = 0, take = 50): Promise<{
    orders: OrderDto[];
    total: number;
  }> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      skip,
      take,
      include: {
        lines: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            providerSessionId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.order.count({ where: { userId } });

    return {
      orders: orders.map((o) => this.formatOrderResponse(o)),
      total,
    };
  }

  /**
   * Get single order
   */
  async getOrder(userId: number, orderId: number): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lines: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            providerSessionId: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to current user');
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Cancel order (only if PENDING_PAYMENT)
   */
  async cancelOrder(userId: number, orderId: number): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lines: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            providerSessionId: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to current user');
    }

    // Only allow cancellation of PENDING_PAYMENT orders
    if (order.status !== 'PENDING_PAYMENT') {
      throw new ConflictException(
        `Cannot cancel order with status: ${order.status}. Only PENDING_PAYMENT orders can be cancelled.`,
      );
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
      include: {
        lines: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            providerSessionId: true,
          },
        },
      },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Update order status (internal use, e.g., from payment service)
   */
  async updateOrderStatus(
    orderId: number,
    status: 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'CANCELLED',
  ): Promise<OrderDto> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        lines: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            providerSessionId: true,
          },
        },
      },
    });

    return this.formatOrderResponse(order);
  }

  // === HELPERS ===

  private async generateOrderCode(): Promise<string> {
    // Generate unique code like ORD-2024-123456
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count();
    return `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private formatOrderResponse(order: any): OrderDto {
    const lines = order.lines.map((line: any) => ({
      id: line.id,
      orderId: line.orderId,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice.toFixed(2),
      currency: line.currency,
      sourceNetworkId: line.sourceNetworkId,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt,
    }));

    return {
      id: order.id,
      code: order.code,
      clientId: order.clientId,
      userId: order.userId,
      quotationId: order.quotationId,
      status: order.status,
      totalAmount: order.totalAmount.toFixed(2),
      currency: order.currency,
      lines,
      payment: order.payment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
