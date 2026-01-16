import { apiGet, apiPatch } from './http';
import { AppConfig, UpdateConfigRequest } from '@/lib/types/config';

export const adminConfigApi = {
  async getConfig(): Promise<AppConfig> {
    return apiGet('/admin/config');
  },

  async updateConfig(data: UpdateConfigRequest): Promise<AppConfig> {
    return apiPatch('/admin/config', data);
  },
};
