export interface Client {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithNetworks extends Client {
  clientNetworks: Array<{
    id: number;
    clientId: number;
    networkId: number;
    network: {
      id: number;
      code: string;
      name: string;
    };
  }>;
}

export interface CreateClientRequest {
  name: string;
  code?: string;
}

export interface UpdateClientRequest {
  name?: string;
  code?: string;
}
