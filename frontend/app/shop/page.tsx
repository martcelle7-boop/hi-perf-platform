'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCatalog } from '@/lib/api/catalog';
import { CatalogProduct } from '@/lib/types/catalog';
import { ProductCard } from '@/components/shop/ProductCard';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ShopPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'NORMAL' | 'PARTNER' | 'GENERIC' | 'ALL'>('ALL');

  const cart = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCatalog({
          q: searchTerm || undefined,
          type: filterType === 'ALL' ? undefined : filterType,
          isActive: true,
        });
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

  const handleAddToCart = async (productId: number) => {
    try {
      await cart.addToCart(productId, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catalogue</h1>
        <Link href="/shop/cart">
          <Button variant="outline">
            Panier ({cart.itemCount})
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2">Recherche</label>
          <Input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type de produit</label>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'NORMAL', 'PARTNER', 'GENERIC'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type === 'ALL' ? 'Tous' : type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center text-gray-500 py-12">
          Chargement des produits...
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Aucun produit trouvé
        </div>
      )}
    </div>
  );
}
