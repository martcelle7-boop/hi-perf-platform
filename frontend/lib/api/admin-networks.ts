import { apiPost, apiGet, apiPatch, apiDelete } from './http';
import { Network, NetworkWithRelations, CreateNetworkRequest, UpdateNetworkRequest } from '@/lib/types/network';

export const adminNetworksApi = {
  async create(data: CreateNetworkRequest): Promise<Network> {
    return apiPost('/admin/networks', data);
  },

  async list(skip = 0, take = 10) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('take', take.toString());
    return apiGet(`/admin/networks?${params.toString()}`);
  },

  async getById(id: number): Promise<NetworkWithRelations> {
    return apiGet(`/admin/networks/${id}`);
  },

  async update(id: number, data: UpdateNetworkRequest): Promise<Network> {
    return apiPatch(`/admin/networks/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`/admin/networks/${id}`);
  },
};
