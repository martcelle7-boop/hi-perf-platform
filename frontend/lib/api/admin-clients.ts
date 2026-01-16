import { apiPost, apiGet, apiPatch, apiDelete } from './http';
import { Client, ClientWithNetworks, CreateClientRequest, UpdateClientRequest } from '@/lib/types/admin';

export const adminClientsApi = {
  async create(data: CreateClientRequest): Promise<Client> {
    return apiPost('/admin/clients', data);
  },

  async list(search?: string, skip = 0, take = 10) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('skip', skip.toString());
    params.append('take', take.toString());
    return apiGet(`/admin/clients?${params.toString()}`);
  },

  async getById(id: number): Promise<ClientWithNetworks> {
    return apiGet(`/admin/clients/${id}`);
  },

  async update(id: number, data: UpdateClientRequest): Promise<Client> {
    return apiPatch(`/admin/clients/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`/admin/clients/${id}`);
  },

  // Client-Networks
  async assignNetwork(clientId: number, networkId: number) {
    return apiPost(`/admin/clients/${clientId}/networks`, { networkId });
  },

  async getNetworks(clientId: number) {
    return apiGet(`/admin/clients/${clientId}/networks`);
  },

  async removeNetwork(clientId: number, networkId: number): Promise<void> {
    return apiDelete(`/admin/clients/${clientId}/networks/${networkId}`);
  },
};
