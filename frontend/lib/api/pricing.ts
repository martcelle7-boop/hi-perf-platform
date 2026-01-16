const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface EffectivePrice {
  productId: number;
  requestedNetworkId: number;
  sourceNetworkId: number;
  isInherited: boolean;
  currency: string;
  amount: string;
  note: string | null;
  checkedNetworkIds: number[];
}

export class PricingApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'PricingApiError';
  }
}

/**
 * Fetch the effective price for a product in a specific network.
 * The backend will inherit the price from the parent network if no explicit price exists.
 */
export async function getEffectivePrice(
  productId: number,
  networkId: number,
  token: string
): Promise<EffectivePrice> {
  const url = `${API_URL}/pricing/products/${productId}/networks/${networkId}/effective`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new PricingApiError(401, 'Unauthorized');
    }
    if (response.status === 404) {
      throw new PricingApiError(404, 'Product not found or not available in this network');
    }
    if (response.status === 409) {
      throw new PricingApiError(409, 'Product is not available in this network');
    }
    throw new PricingApiError(response.status, 'Failed to fetch product price');
  }

  return response.json();
}
