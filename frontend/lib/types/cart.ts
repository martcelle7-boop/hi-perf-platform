/**
 * Cart types
 */

export interface CartProduct {
  id: number;
  code: string;
  name: string;
  type: 'NORMAL' | 'PARTNER' | 'GENERIC';
  brand?: string;
  unit?: string;
}

export interface CartLine {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: string; // Decimal as string
  sourceNetworkId: number;
  currency: string;
  metadata?: Record<string, any>;
  product?: CartProduct;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  clientId: number;
  userId: number;
  status: 'ACTIVE' | 'LOCKED' | 'CONVERTED';
  currency: string;
  lines: CartLine[];
  totalItems?: number;
  totalAmount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  metadata?: string;
}

export interface UpdateCartLineRequest {
  quantity: number;
  metadata?: string;
}
