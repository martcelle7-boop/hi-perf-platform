/**
 * Catalog product types
 */

export type ProductType = 'NORMAL' | 'PARTNER' | 'GENERIC';

export interface ProductPrice {
  kind: 'NUMERIC' | 'TEXT' | 'ON_REQUEST';
  currency?: string;
  amount?: string; // Decimal as string
  sourceNetworkId?: number;
  note?: string;
  isInherited?: boolean;
}

export interface PublicPrice {
  currency: string;
  amount: string; // Decimal as string
  isTTC: boolean;
}

export interface ProductNetwork {
  id: number;
  code: string;
  name: string;
  type: string;
}

export interface CatalogProduct {
  id: number;
  code: string;
  name: string;
  description?: string;
  longDescription?: string;
  type: ProductType;
  isActive: boolean;
  price: ProductPrice;
  publicPrice?: PublicPrice;
  priceDescription?: string | null;
  brand?: string;
  unit?: string;
  shippingFee?: string;
  activationService?: boolean;
  externalUrl?: string | null;
  partnerCode?: string;
  networks?: ProductNetwork[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogResponse {
  products: CatalogProduct[];
  total: number;
}
