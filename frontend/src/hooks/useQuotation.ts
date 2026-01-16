'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentQuotation,
  addItemToQuotation as apiAddItem,
  removeItemFromQuotation,
  submitQuotation as apiSubmitQuotation,
  Quotation,
  QuotationItem,
} from '@/lib/api/quotations';

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
  const { token } = useAuth();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch quotation on mount and when token changes
  const refetch = useCallback(async () => {
    if (!token) {
      setQuotation(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getCurrentQuotation(token);
      setQuotation(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotation';
      setError(errorMessage);
      setQuotation(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addItem = useCallback(async (productId: number, quantity: number) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setError(null);
    try {
      await apiAddItem(productId, quantity, token);
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
    }
  }, [token, refetch]);

  const removeItem = useCallback(async (itemId: number) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setError(null);
    try {
      await removeItemFromQuotation(itemId, token);
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
    }
  }, [token, refetch]);

  const submitQuotation = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setError(null);
    try {
      await apiSubmitQuotation(token);
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quotation';
      setError(errorMessage);
    }
  }, [token, refetch]);

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
