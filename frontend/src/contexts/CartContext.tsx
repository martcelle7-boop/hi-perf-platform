'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '@/src/features/products/types';

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shop-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Restore cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to restore cart:', error);
      }
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const calculateTotalAmount = (items: CartItem[]): number => {
    return items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  };

  const addToCart = useCallback(
    (product: Product, quantity: number) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.productId === product.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            price: product.price.amount,
            quantity,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const totalAmount = calculateTotalAmount(cartItems);

  const value: CartContextType = {
    cartItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
