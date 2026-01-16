/**
 * Payments API client
 */

import { apiPost, apiGet } from './http';
import { CreateCheckoutSessionRequest, CheckoutSessionResponse, PaymentStatus } from '@/lib/types/payment';

export async function createCheckoutSession(
  orderId: string | number,
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutSessionResponse> {
  const body: CreateCheckoutSessionRequest = { orderId: typeof orderId === 'string' ? parseInt(orderId) : orderId };
  if (successUrl) body.successUrl = successUrl;
  if (cancelUrl) body.cancelUrl = cancelUrl;

  return apiPost<CheckoutSessionResponse>('/payments/checkout-session', body);
}

export async function getPaymentStatus(orderId: string | number): Promise<PaymentStatus> {
  return apiGet<PaymentStatus>(`/payments/status/${orderId}`);
}
