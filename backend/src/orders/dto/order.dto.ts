export class OrderLineDto {
  id: number;
  orderId: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: string; // Decimal as string
  currency: string;
  sourceNetworkId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderDto {
  id: number;
  code: string;
  clientId: number;
  userId: number;
  quotationId?: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'CANCELLED';
  totalAmount: string; // Decimal as string
  currency: string;
  lines: OrderLineDto[];
  payment?: {
    id: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    provider: string;
    providerSessionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class CreateOrderFromQuotationDto {
  quotationId: number;
}

export class CancelOrderDto {
  reason?: string;
}
