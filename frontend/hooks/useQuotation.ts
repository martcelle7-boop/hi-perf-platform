'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentQuotation,
  addItemToQuotation as apiAddItem,
  removeItemFromQuotation,
  submitQuotation as apiSubmitQuotation,
} from '@/lib/api/quotations';
import { Quotation } from '@/lib/types/quotation';

interface UseQuotationReturn {
  quotation: Quotation | null;
  isLoading: boolean;
  error: string | null;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  submitQuotation: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage the quotation (cart) system
 */
export function useQuotation(): UseQuotationReturn {
  const { isAuthenticated } = useAuth();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch quotation on mount and when token changes
  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setQuotation(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getCurrentQuotation();
      setQuotation(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotation';
      setError(errorMessage);
      setQuotation(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addItem = useCallback(async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setError(null);
    try {
      await apiAddItem(productId, quantity);
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
    }
  }, [isAuthenticated, refetch]);

  const removeItem = useCallback(async (itemId: number) => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setError(null);
    try {
      await removeItemFromQuotation(itemId);
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
    }
  }, [isAuthenticated, refetch]);

  const submitQuotation = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setError(null);
    try {
      await apiSubmitQuotation();
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quotation';
      setError(errorMessage);
    }
  }, [isAuthenticated, refetch]);

  return {
    quotation,
    isLoading,
    error,
    addItem,
    removeItem,
    submitQuotation,
    refetch,
  };
}
