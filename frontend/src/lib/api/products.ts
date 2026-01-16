import { Product } from '@/src/features/products/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GetProductsParams {
  q?: string;
  isActive?: boolean;
  networkId?: number;
}

export class ProductsApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ProductsApiError';
  }
}

export async function getProducts(
  token: string,
  params?: GetProductsParams
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.q) queryParams.append('q', params.q);
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
  if (params?.networkId) queryParams.append('networkId', String(params.networkId));

  const url = `${API_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ProductsApiError(401, 'Unauthorized');
    }
    throw new ProductsApiError(response.status, 'Failed to fetch products');
  }

  return response.json();
}

export async function getProductById(
  id: number,
  token: string
): Promise<Product> {
  const url = `${API_URL}/products/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ProductsApiError(401, 'Unauthorized');
    }
    if (response.status === 404) {
      throw new ProductsApiError(404, 'Product not found');
    }
    throw new ProductsApiError(response.status, 'Failed to fetch product');
  }

  return response.json();
}
