import { apiPost, apiGet, apiPatch, apiDelete } from './http';
import { AdminUser, CreateAdminUserRequest, UpdateAdminUserRequest } from '@/lib/types/admin-user';

export const adminUsersApi = {
  async create(data: CreateAdminUserRequest): Promise<AdminUser> {
    return apiPost('/admin/users', data);
  },

  async list(clientId?: number, search?: string, skip = 0, take = 10) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId.toString());
    if (search) params.append('search', search);
    params.append('skip', skip.toString());
    params.append('take', take.toString());
    return apiGet(`/admin/users?${params.toString()}`);
  },

  async getById(id: number): Promise<AdminUser> {
    return apiGet(`/admin/users/${id}`);
  },

  async update(id: number, data: UpdateAdminUserRequest): Promise<AdminUser> {
    return apiPatch(`/admin/users/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`/admin/users/${id}`);
  },
};
