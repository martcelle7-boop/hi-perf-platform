import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProvider } from './payment.provider';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService implements PaymentProvider {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly webhookSecret: string;

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15' as any,
    });
  }

  /**
   * Create a checkout session for an order
   */
  async createCheckoutSession(
    orderId: number,
    amount: string,
    currency: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    // Get order details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { email: true },
        },
        lines: {
          select: {
            productName: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException(`Order ${orderId} not found`);
    }

    // Prepare line items
    const lineItems = order.lines.map((line) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: line.productName,
        },
        unit_amount: Math.round(parseFloat(line.unitPrice.toFixed(2)) * 100), // Convert to cents
      },
      quantity: line.quantity,
    }));

    try {
      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: order.user?.email, // Will be added via relation
        metadata: {
          orderId: order.id.toString(),
          orderCode: order.code,
        },
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url || '',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create Stripe session for order ${orderId}`,
        error,
      );
      throw new BadRequestException('Failed to create payment session');
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(
    body: string,
    signature: string,
  ): Promise<boolean> {
    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return false;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret,
      );
      return true;
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      return false;
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhookEvent(
    eventType: string,
    eventData: any,
  ): Promise<{
    orderId: number;
    status: 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PROCESSING';
    providerSessionId?: string;
    providerPaymentIntentId?: string;
  }> {
    const sessionId = eventData.id;
    const status = eventData.payment_status;

    // Fetch session details from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    const orderId = parseInt(
      (session.metadata?.orderId as string) || '0',
      10,
    );

    if (!orderId) {
      throw new BadRequestException('Order ID not found in session metadata');
    }

    // Map Stripe payment status to our status
    let paymentStatus: 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PROCESSING';

    switch (eventType) {
      case 'checkout.session.completed':
        paymentStatus = 'COMPLETED';
        break;
      case 'charge.failed':
      case 'payment_intent.payment_failed':
        paymentStatus = 'FAILED';
        break;
      case 'charge.refunded':
        paymentStatus = 'REFUNDED';
        break;
      case 'payment_intent.processing':
        paymentStatus = 'PROCESSING';
        break;
      default:
        paymentStatus = 'PROCESSING';
    }

    return {
      orderId,
      status: paymentStatus,
      providerSessionId: session.id,
      providerPaymentIntentId: session.payment_intent as string,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    sessionId: string,
  ): Promise<{
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    providerPaymentIntentId?: string;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      let status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' =
        'PENDING';

      switch (session.payment_status) {
        case 'paid':
          status = 'COMPLETED';
          break;
        case 'unpaid':
          status = 'PENDING';
          break;
      }

      return {
        status,
        providerPaymentIntentId: session.payment_intent as string,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get payment status for session ${sessionId}`,
        error,
      );
      throw new BadRequestException('Failed to get payment status');
    }
  }
}
