export type ProductType = 'GENERIC' | 'NORMAL' | 'PARTNER';

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  type: ProductType;
  publicPrice: string | null; // Decimal as string
  isPublicPriceTTC: boolean;
  priceDescription: string | null;
  brand: string | null;
  unit: string | null;
  shippingFee: string | null;
  activationService: boolean;
  externalUrl: string | null;
  partnerCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithRelations extends Product {
  productNetworks: Array<{
    id: number;
    productId: number;
    networkId: number;
    network: {
      id: number;
      code: string;
      name: string;
    };
  }>;
  productPrices: Array<{
    id: number;
    productId: number;
    networkId: number;
    currency: string;
    amount: string;
    isActive: boolean;
    note: string | null;
    network: {
      id: number;
      code: string;
      name: string;
    };
  }>;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description?: string;
  type: ProductType;
  publicPrice?: string;
  isPublicPriceTTC?: boolean;
  priceDescription?: string;
  brand?: string;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  code?: string;
  name?: string;
  description?: string;
  type?: ProductType;
  publicPrice?: string;
  isPublicPriceTTC?: boolean;
  priceDescription?: string;
  brand?: string;
  isActive?: boolean;
}

export interface ProductPriceDto {
  id: number;
  productId: number;
  networkId: number;
  currency: string;
  amount: string;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPriceRequest {
  networkId: number;
  amount: string;
  currency?: string;
  isActive?: boolean;
  note?: string;
}

export interface UpdateProductPriceRequest {
  amount?: string;
  currency?: string;
  isActive?: boolean;
  note?: string;
}

export interface AssignProductNetworkRequest {
  networkId: number;
  isActive: boolean;
}
