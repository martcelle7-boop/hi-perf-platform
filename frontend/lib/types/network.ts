export interface Network {
  id: number;
  code: string;
  name: string;
  type: 'NORMAL' | 'PARTNER';
  parentNetworkId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkWithRelations extends Network {
  childNetworks: Network[];
  parentNetwork: Network | null;
  clientNetworks: Array<{
    id: number;
    clientId: number;
    networkId: number;
    client: {
      id: number;
      name: string;
    };
  }>;
}

export interface CreateNetworkRequest {
  code: string;
  name: string;
  type?: 'NORMAL' | 'PARTNER';
  parentNetworkId?: number;
}

export interface UpdateNetworkRequest {
  code?: string;
  name?: string;
  type?: 'NORMAL' | 'PARTNER';
  parentNetworkId?: number;
}
