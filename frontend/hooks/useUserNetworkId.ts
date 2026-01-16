'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/api/clients';

/**
 * Hook to get the primary network ID for the current user
 * For MVP, assumes the user has exactly one active network
 * Returns null if user is not authenticated or has no networks
 */
export function useUserNetworkId() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token || !user.clientId) {
      setNetworkId(null);
      setIsLoading(false);
      return;
    }

    const fetchNetworkId = async () => {
      try {
        setIsLoading(true);
        const client = await getClient(user.clientId!, token);
        
        // For MVP: get the first network
        if (client.networks && client.networks.length > 0) {
          setNetworkId(client.networks[0].id);
        } else {
          setError('User has no networks');
          setNetworkId(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user network';
        setError(errorMessage);
        setNetworkId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkId();
  }, [user, token, authLoading]);

  return { networkId, isLoading, error };
}
