import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * POST /payments/checkout-session
   * Create checkout session for an order
   */
  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCheckoutSession(
    @Request() req: any,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    const userId = req.user.id;
    return this.paymentService.createCheckoutSession(userId, dto);
  }

  /**
   * GET /payments/status/:orderId
   * Get payment status for an order
   */
  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Request() req: any,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const userId = req.user.id;
    return this.paymentService.getPaymentStatus(userId, orderId);
  }

  /**
   * POST /payments/webhook
   * Stripe webhook endpoint (no auth required)
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body(
      'raw',
    )
    rawBody: string | Buffer,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Convert to string if buffer
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    // Verify webhook signature
    const isValid = await this.stripeService.verifyWebhookSignature(
      body,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Parse event
    const event = JSON.parse(body);

    // Handle event
    await this.paymentService.handleWebhook(event.type, event.data.object);

    return { received: true };
  }
}
