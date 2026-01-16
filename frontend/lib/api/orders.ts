/**
 * Orders API client
 */

import { apiGet, apiPost } from './http';
import { Order, CreateOrderRequest, ListOrdersResponse } from '@/lib/types/order';

export async function listOrders(): Promise<Order[]> {
  const response = await apiGet<ListOrdersResponse>('/orders');
  return response.orders || [];
}

export async function getOrder(orderId: string | number): Promise<Order> {
  return apiGet<Order>(`/orders/${orderId}`);
}

export async function createOrder(quotationId: string | number): Promise<Order> {
  const body: CreateOrderRequest = { quotationId: typeof quotationId === 'string' ? parseInt(quotationId) : quotationId };
  return apiPost<Order>('/orders', body);
}

export async function cancelOrder(orderId: string | number): Promise<Order> {
  return apiPost<Order>(`/orders/${orderId}/cancel`, {});
}
