import { useState, useCallback } from 'react';
import { boProductsApi } from '@/lib/api/bo-products';
import { Product, ProductPriceDto } from '@/lib/types/product';
import { toast } from 'sonner';

export const useBoProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listProducts = useCallback(async (search?: string, type?: string, isActive?: string, skip = 0, take = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await boProductsApi.list(search, type, isActive, skip, take);
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setProducts(data);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch products';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: any) => {
    try {
      const product = await boProductsApi.create(data);
      toast.success('Product created');
      return product;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
      return null;
    }
  }, []);

  const updateProduct = useCallback(async (id: number, data: any) => {
    try {
      const product = await boProductsApi.update(id, data);
      toast.success('Product updated');
      return product;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
      return null;
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await boProductsApi.delete(id);
      toast.success('Product deleted');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
      return false;
    }
  }, []);

  // Pricing helpers
  const createPrice = useCallback(async (productId: number, networkId: number, amount: string, note?: string) => {
    try {
      const price = await boProductsApi.createPrice(productId, { networkId, amount, note });
      toast.success('Price created');
      return price;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create price');
      return null;
    }
  }, []);

  const updatePrice = useCallback(async (priceId: number, data: any) => {
    try {
      const price = await boProductsApi.updatePrice(priceId, data);
      toast.success('Price updated');
      return price;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update price');
      return null;
    }
  }, []);

  const deletePrice = useCallback(async (priceId: number) => {
    try {
      await boProductsApi.deletePrice(priceId);
      toast.success('Price deleted');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete price');
      return false;
    }
  }, []);

  return {
    products,
    loading,
    error,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createPrice,
    updatePrice,
    deletePrice,
  };
};
