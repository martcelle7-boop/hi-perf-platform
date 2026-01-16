const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface QuotationItem {
  id: number;
  quotationId: number;
  productId: number;
  quantity: number;
  unitPrice: string | null;
  currency: string;
  product: {
    id: number;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: number;
  clientId: number;
  userId: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  totalAmount: string;
  currency: string;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
}

export class QuotationsApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'QuotationsApiError';
  }
}

/**
 * Get current draft quotation for the authenticated user
 */
export async function getCurrentQuotation(token: string): Promise<Quotation> {
  const url = `${API_URL}/quotations/current`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new QuotationsApiError(401, 'Unauthorized');
    }
    throw new QuotationsApiError(response.status, 'Failed to fetch quotation');
  }

  return response.json();
}

/**
 * Add item to current quotation
 */
export async function addItemToQuotation(
  productId: number,
  quantity: number,
  token: string
): Promise<QuotationItem> {
  const url = `${API_URL}/quotations/current/items`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new QuotationsApiError(401, 'Unauthorized');
    }
    if (response.status === 400) {
      throw new QuotationsApiError(400, 'Invalid request');
    }
    if (response.status === 404) {
      throw new QuotationsApiError(404, 'Product not found');
    }
    throw new QuotationsApiError(response.status, 'Failed to add item');
  }

  return response.json();
}

/**
 * Remove item from current quotation
 */
export async function removeItemFromQuotation(
  itemId: number,
  token: string
): Promise<{ success: boolean }> {
  const url = `${API_URL}/quotations/current/items/${itemId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new QuotationsApiError(401, 'Unauthorized');
    }
    if (response.status === 403) {
      throw new QuotationsApiError(403, 'Forbidden');
    }
    if (response.status === 404) {
      throw new QuotationsApiError(404, 'Item not found');
    }
    throw new QuotationsApiError(response.status, 'Failed to remove item');
  }

  return response.json();
}

/**
 * Submit quotation (change status to SENT)
 */
export async function submitQuotation(
  token: string
): Promise<Quotation> {
  const url = `${API_URL}/quotations/current/submit`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'SENT',
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new QuotationsApiError(401, 'Unauthorized');
    }
    if (response.status === 400) {
      throw new QuotationsApiError(400, 'Invalid request');
    }
    throw new QuotationsApiError(response.status, 'Failed to submit quotation');
  }

  return response.json();
}
