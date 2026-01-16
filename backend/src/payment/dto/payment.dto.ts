export class CreateCheckoutSessionDto {
  orderId: number;
  successUrl?: string;
  cancelUrl?: string;
}

export class PaymentWebhookDto {
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      payment_status: string;
      [key: string]: any;
    };
  };
}

export class PaymentStatusDto {
  id: number;
  orderId: number;
  provider: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: string;
  currency: string;
  providerSessionId?: string;
  providerPaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CheckoutSessionResponseDto {
  sessionId: string;
  checkoutUrl: string;
}
