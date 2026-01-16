/**
 * Catalog API client
 */

import { apiGet } from './http';
import { CatalogProduct, CatalogResponse } from '@/lib/types/catalog';

export async function getCatalog(params?: {
  q?: string;
  networkId?: number;
  type?: 'NORMAL' | 'PARTNER' | 'GENERIC';
  isActive?: boolean;
  skip?: number;
  take?: number;
}): Promise<CatalogProduct[]> {
  const searchParams = new URLSearchParams();

  if (params?.q) searchParams.set('q', params.q);
  if (params?.networkId) searchParams.set('networkId', params.networkId.toString());
  if (params?.type) searchParams.set('type', params.type);
  if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.take !== undefined) searchParams.set('take', params.take.toString());

  const query = searchParams.toString();
  const path = query ? `/catalog?${query}` : '/catalog';

  const response = await apiGet<CatalogResponse>(path);
  return response.products;
}

export async function getCatalogProduct(productId: number): Promise<CatalogProduct> {
  return apiGet<CatalogProduct>(`/catalog/${productId}`);
}

export async function searchProducts(
  term: string,
  type?: 'NORMAL' | 'PARTNER' | 'GENERIC',
  limit?: number
): Promise<CatalogProduct[]> {
  const params = new URLSearchParams({ term });
  if (type) params.set('type', type);
  if (limit) params.set('limit', limit.toString());

  return apiGet<CatalogProduct[]>(`/catalog/search/${term}?${params.toString()}`);
}
