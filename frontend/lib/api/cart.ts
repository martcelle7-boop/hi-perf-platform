/**
 * Cart API client
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './http';
import { Cart, AddToCartRequest, UpdateCartLineRequest } from '@/lib/types/cart';

export async function getCart(): Promise<Cart> {
  return apiGet<Cart>('/cart');
}

export async function addToCart(
  productId: number,
  quantity: number,
  metadata?: string
): Promise<Cart> {
  const body: AddToCartRequest = { productId, quantity };
  if (metadata) body.metadata = metadata;

  return apiPost<Cart>('/cart/lines', body);
}

export async function updateCartLine(
  cartLineId: string | number,
  quantity: number,
  metadata?: string
): Promise<Cart> {
  const body: UpdateCartLineRequest = { quantity };
  if (metadata) body.metadata = metadata;

  return apiPatch<Cart>(`/cart/lines/${cartLineId}`, body);
}

export async function removeCartLine(cartLineId: string | number): Promise<Cart> {
  return apiDelete<Cart>(`/cart/lines/${cartLineId}`);
}

export async function clearCart(): Promise<Cart> {
  return apiPost<Cart>('/cart/clear', {});
}
