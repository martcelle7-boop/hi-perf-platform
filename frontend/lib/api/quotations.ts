/**
 * Quotations API client
 */

import { apiGet, apiPost, apiDelete, apiPatch } from './http';
import {
  Quotation,
  QuotationItem,
  CreateQuotationFromCartResponse,
  AcceptQuotationResponse,
} from '@/lib/types/quotation';

export async function getCurrentQuotation(): Promise<Quotation> {
  return apiGet<Quotation>('/quotations/current');
}

export async function addItemToQuotation(
  productId: number,
  quantity: number,
): Promise<QuotationItem> {
  return apiPost<QuotationItem>('/quotations/current/items', { productId, quantity });
}

export async function updateQuotationItem(
  itemId: string | number,
  quantity: number,
): Promise<QuotationItem> {
  return apiPatch<QuotationItem>(`/quotations/items/${itemId}`, { quantity });
}

export async function removeItemFromQuotation(
  itemId: string | number,
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/quotations/items/${itemId}`);
}

export async function submitQuotation(
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' = 'SENT',
): Promise<Quotation> {
  return apiPost<Quotation>('/quotations/current/submit', { status });
}

export async function createQuotationFromCart(): Promise<CreateQuotationFromCartResponse> {
  return apiPost<CreateQuotationFromCartResponse>('/quotations/from-cart', {});
}

export async function getQuotationById(quotationId: string | number): Promise<Quotation> {
  return apiGet<Quotation>(`/quotations/${quotationId}`);
}

export async function listQuotations(): Promise<Quotation[]> {
  const response = await apiGet<{ quotations: Quotation[] }>('/quotations');
  return response.quotations || [];
}

export async function acceptQuotation(quotationId: string | number): Promise<AcceptQuotationResponse> {
  return apiPost<AcceptQuotationResponse>(`/quotations/${quotationId}/accept`, {
    comment: 'Order approved',
  });
}

export async function rejectQuotation(quotationId: string | number, reason?: string): Promise<Quotation> {
  return apiPost<Quotation>(`/quotations/${quotationId}/reject`, {
    reason: reason || 'Rejected by user',
  });
}
