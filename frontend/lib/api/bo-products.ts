import { apiPost, apiGet, apiPatch, apiDelete } from './http';
import {
  Product,
  ProductWithRelations,
  CreateProductRequest,
  UpdateProductRequest,
  ProductPriceDto,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
  AssignProductNetworkRequest,
} from '@/lib/types/product';

export const boProductsApi = {
  async create(data: CreateProductRequest): Promise<Product> {
    return apiPost('/bo/products', data);
  },

  async list(search?: string, type?: string, isActive?: string, skip = 0, take = 10) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (isActive) params.append('isActive', isActive);
    params.append('skip', skip.toString());
    params.append('take', take.toString());
    return apiGet(`/bo/products?${params.toString()}`);
  },

  async getById(id: number): Promise<ProductWithRelations> {
    return apiGet(`/bo/products/${id}`);
  },

  async update(id: number, data: UpdateProductRequest): Promise<Product> {
    return apiPatch(`/bo/products/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`/bo/products/${id}`);
  },

  // Product-Networks Visibility
  async assignNetwork(productId: number, data: AssignProductNetworkRequest) {
    return apiPost(`/bo/products/${productId}/networks`, data);
  },

  async getNetworks(productId: number) {
    return apiGet(`/bo/products/${productId}/networks`);
  },

  async removeNetwork(productId: number, networkId: number): Promise<void> {
    return apiDelete(`/bo/products/${productId}/networks/${networkId}`);
  },

  async updateNetworkStatus(productId: number, networkId: number, isActive: boolean) {
    return apiPatch(`/bo/products/${productId}/networks/${networkId}`, { isActive });
  },

  // Product-Prices
  async createPrice(productId: number, data: CreateProductPriceRequest): Promise<ProductPriceDto> {
    return apiPost(`/bo/products/${productId}/prices`, data);
  },

  async getPrices(productId: number): Promise<ProductPriceDto[]> {
    return apiGet(`/bo/products/${productId}/prices`);
  },

  async updatePrice(priceId: number, data: UpdateProductPriceRequest): Promise<ProductPriceDto> {
    return apiPatch(`/bo/product-prices/${priceId}`, data);
  },

  async deletePrice(priceId: number): Promise<void> {
    return apiDelete(`/bo/product-prices/${priceId}`);
  },
};
