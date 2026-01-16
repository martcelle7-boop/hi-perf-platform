export interface PaymentProvider {
  /**
   * Create a checkout session for an order
   */
  createCheckoutSession(
    orderId: number,
    amount: string,
    currency: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{
    sessionId: string;
    checkoutUrl: string;
  }>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
  ): Promise<boolean>;

  /**
   * Handle webhook event
   */
  handleWebhookEvent(
    eventType: string,
    eventData: any,
  ): Promise<{
    orderId: number;
    status: 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PROCESSING';
    providerSessionId?: string;
    providerPaymentIntentId?: string;
  }>;

  /**
   * Get payment status
   */
  getPaymentStatus(
    sessionId: string,
  ): Promise<{
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    providerPaymentIntentId?: string;
  }>;
}
