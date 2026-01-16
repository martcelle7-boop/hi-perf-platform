/**
 * Order types
 */

export interface OrderLine {
  id: number;
  orderId: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: string; // Decimal as string
  currency: string;
  sourceNetworkId: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPayment {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  provider: string;
  providerSessionId?: string;
}

export interface Order {
  id: number;
  code: string;
  clientId: number;
  userId: number;
  quotationId?: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'CANCELLED';
  totalAmount: string; // Decimal as string
  currency: string;
  lines: OrderLine[];
  payment?: OrderPayment;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  quotationId: number;
}

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
}
