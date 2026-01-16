'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Product } from '@/src/features/products/types';
import { getProducts, ProductsApiError } from '@/lib/api/products';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, token, isLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch products if authenticated
    if (isAuthenticated && token) {
      const fetchProducts = async () => {
        try {
          setIsLoadingProducts(true);
          setError(null);
          const data = await getProducts(token);
          setProducts(data);
        } catch (err) {
          if (err instanceof ProductsApiError && err.status === 401) {
            router.push('/login');
          } else {
            setError('Failed to load products. Please try again.');
            console.error('Failed to fetch products:', err);
          }
        } finally {
          setIsLoadingProducts(false);
        }
      };

      fetchProducts();
    }
  }, [isAuthenticated, token, isLoading, router]);

  if (isLoading || isLoadingProducts) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">
          Browse our collection of high-performance tech products.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
