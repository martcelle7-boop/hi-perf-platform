const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ClientNetwork {
  id: number;
  code: string;
  name: string;
  type: 'NORMAL' | 'PARTNER';
  parentNetworkId: number | null;
}

export interface Client {
  id: number;
  name: string;
  networks: ClientNetwork[];
}

export class ClientsApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ClientsApiError';
  }
}

/**
 * Fetch client details including networks
 */
export async function getClient(
  clientId: number,
  token: string
): Promise<Client> {
  const url = `${API_URL}/clients/${clientId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ClientsApiError(401, 'Unauthorized');
    }
    if (response.status === 404) {
      throw new ClientsApiError(404, 'Client not found');
    }
    throw new ClientsApiError(response.status, 'Failed to fetch client');
  }

  return response.json();
}
