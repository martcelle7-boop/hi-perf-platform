'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { Cart, CartLine } from '@/lib/types/cart';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartLine as apiUpdateCartLine,
  removeCartLine as apiRemoveCartLine,
  clearCart as apiClearCart,
} from '@/lib/api/cart';
import { ApiError } from '@/lib/api/http';

export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: ApiError | null;
  refresh: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateLine: (lineId: number, quantity: number) => Promise<void>;
  removeLine: (lineId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  totalAmount: string;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        const data = await getCart();
        setCart(data);
        setError(null);
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError(0, String(err));
        setError(apiError);
        console.error('Failed to load cart:', apiError);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(0, String(err));
      setError(apiError);
      console.error('Failed to refresh cart:', apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const data = await apiAddToCart(productId, quantity);
      setCart(data);
      setError(null);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(0, String(err));
      setError(apiError);
      console.error('Failed to add to cart:', apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLine = useCallback(async (lineId: string | number, quantity: number) => {
    setIsLoading(true);
    try {
      const data = await apiUpdateCartLine(lineId, quantity);
      setCart(data);
      setError(null);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(0, String(err));
      setError(apiError);
      console.error('Failed to update cart line:', apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeLine = useCallback(async (lineId: string | number) => {
    setIsLoading(true);
    try {
      const data = await apiRemoveCartLine(lineId);
      setCart(data);
      setError(null);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(0, String(err));
      setError(apiError);
      console.error('Failed to remove from cart:', apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClearCart();
      setCart(data);
      setError(null);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(0, String(err));
      setError(apiError);
      console.error('Failed to clear cart:', apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const itemCount = cart?.lines?.length ?? 0;
  const totalAmount = cart?.totalAmount ?? '0.00';

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    refresh,
    addToCart,
    updateLine,
    removeLine,
    clearCart,
    itemCount,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
