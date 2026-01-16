/**
 * Payment types
 */

export interface CreateCheckoutSessionRequest {
  orderId: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentStatus {
  id: number;
  orderId: number;
  provider: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: string;
  currency: string;
  providerSessionId?: string;
  providerPaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}
