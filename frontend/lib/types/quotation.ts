/**
 * Quotation types
 */

export interface QuotationItem {
  id: number;
  quotationId: number;
  productId: number;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: string | number | null; // Decimal as string from API or null when unavailable
  currency?: string;
  product?: {
    id: number;
    code: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Backward-compatible alias for older references
export type QuotationLine = QuotationItem;

export interface Quotation {
  id: number;
  code?: string;
  userId: number;
  clientId: number;
  networkId: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  currency: string;
  items: QuotationItem[];
  totalAmount?: string | number | null;
  orderId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationFromCartResponse {
  id: number;
  code?: string;
  status: string;
  items: QuotationItem[];
}

export interface AcceptQuotationResponse {
  orderId?: number;
  id?: number;
  status?: string;
}
