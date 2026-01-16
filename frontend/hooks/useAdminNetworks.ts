import { useState, useCallback } from 'react';
import { adminNetworksApi } from '@/lib/api/admin-networks';
import { Network } from '@/lib/types/network';
import { toast } from 'sonner';

export const useAdminNetworks = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNetworks = useCallback(async (skip = 0, take = 100) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminNetworksApi.list(skip, take);
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setNetworks(data);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch networks';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNetwork = useCallback(
    async (code: string, name: string, type = 'NORMAL', parentNetworkId?: number) => {
      try {
        const network = await adminNetworksApi.create({ code, name, type: type as any, parentNetworkId });
        toast.success('Network created');
        return network;
      } catch (err: any) {
        toast.error(err.message || 'Failed to create network');
        return null;
      }
    },
    [],
  );

  const updateNetwork = useCallback(async (id: number, code?: string, name?: string, type?: string, parentNetworkId?: number) => {
    try {
      const network = await adminNetworksApi.update(id, { code, name, type: type as any, parentNetworkId });
      toast.success('Network updated');
      return network;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update network');
      return null;
    }
  }, []);

  const deleteNetwork = useCallback(async (id: number) => {
    try {
      await adminNetworksApi.delete(id);
      toast.success('Network deleted');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete network');
      return false;
    }
  }, []);

  return { networks, loading, error, listNetworks, createNetwork, updateNetwork, deleteNetwork };
};
