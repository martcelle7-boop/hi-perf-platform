import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import {
  CreateCheckoutSessionDto,
  PaymentStatusDto,
  CheckoutSessionResponseDto,
} from './dto/payment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Create a checkout session for an order
   */
  async createCheckoutSession(
    userId: number,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    // Get order
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        user: { select: { id: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to current user');
    }

    // Verify order is PENDING_PAYMENT
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        `Order must be PENDING_PAYMENT to create checkout session. Current status: ${order.status}`,
      );
    }

    // Build URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = dto.successUrl || `${baseUrl}/orders/${order.id}/success`;
    const cancelUrl = dto.cancelUrl || `${baseUrl}/orders/${order.id}`;

    // Create Stripe session
    const { sessionId, checkoutUrl } =
      await this.stripeService.createCheckoutSession(
        order.id,
        order.totalAmount.toFixed(2),
        order.currency,
        successUrl,
        cancelUrl,
      );

    // Create or update Payment record
    const payment = await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: 'stripe',
        providerSessionId: sessionId,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'PENDING',
      },
      update: {
        providerSessionId: sessionId,
      },
    });

    return {
      sessionId,
      checkoutUrl,
    };
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhook(eventType: string, eventData: any): Promise<void> {
    try {
      const result = await this.stripeService.handleWebhookEvent(
        eventType,
        eventData,
      );

      const { orderId, status, providerSessionId, providerPaymentIntentId } =
        result;

      // Get order
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return; // Order not found, skip
      }

      // Update payment status
      await this.prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          provider: 'stripe',
          providerSessionId,
          providerPaymentIntentId,
          amount: order.totalAmount,
          currency: order.currency,
          status,
        },
        update: {
          status,
          providerSessionId,
          providerPaymentIntentId,
        },
      });

      // Update order status based on payment status
      let orderStatus = order.status;

      if (status === 'COMPLETED') {
        orderStatus = 'PAID';
      } else if (status === 'FAILED') {
        // Keep order as PENDING_PAYMENT so user can retry
      }

      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: orderStatus as any },
      });
    } catch (error) {
      console.error('Error handling webhook:', error);
      // Don't throw - webhooks should return 200 OK even on processing errors
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(userId: number, orderId: number): Promise<PaymentStatusDto> {
    // Get order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to current user');
    }

    // Get payment
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment not found for order ${orderId}`);
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      status: payment.status,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      providerSessionId: payment.providerSessionId || undefined,
      providerPaymentIntentId: payment.providerPaymentIntentId || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
