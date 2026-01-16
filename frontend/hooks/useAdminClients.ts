import { useState, useCallback } from 'react';
import { adminClientsApi } from '@/lib/api/admin-clients';
import { Client } from '@/lib/types/admin';
import { toast } from 'sonner';

export const useAdminClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listClients = useCallback(async (search?: string, skip = 0, take = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminClientsApi.list(search, skip, take);
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setClients(data);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch clients';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (name: string, code?: string) => {
    try {
      const client = await adminClientsApi.create({ name, code });
      toast.success('Client created');
      return client;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create client');
      return null;
    }
  }, []);

  const updateClient = useCallback(async (id: number, name?: string, code?: string) => {
    try {
      const client = await adminClientsApi.update(id, { name, code });
      toast.success('Client updated');
      return client;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update client');
      return null;
    }
  }, []);

  const deleteClient = useCallback(async (id: number) => {
    try {
      await adminClientsApi.delete(id);
      toast.success('Client deleted');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete client');
      return false;
    }
  }, []);

  return { clients, loading, error, listClients, createClient, updateClient, deleteClient };
};
