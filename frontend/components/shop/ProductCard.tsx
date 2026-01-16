'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserNetworkId } from '@/src/hooks/useUserNetworkId';
import { useQuotation } from '@/src/hooks/useQuotation';
import { getEffectivePrice } from '@/lib/api/pricing';
import { Product } from '@/src/features/products/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<{ amount: string; currency: string } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { token } = useAuth();
  const { networkId } = useUserNetworkId();
  const { addItem } = useQuotation();

  // Fetch effective price for this product in the user's network
  useEffect(() => {
    if (!token || !networkId) {
      setPrice(null);
      return;
    }

    const fetchPrice = async () => {
      setPriceLoading(true);
      setPriceError(null);
      try {
        const effectivePrice = await getEffectivePrice(product.id, networkId, token);
        setPrice({
          amount: effectivePrice.amount,
          currency: effectivePrice.currency,
        });
      } catch (error) {
        setPriceError(error instanceof Error ? error.message : 'Failed to fetch price');
        setPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [product.id, networkId, token]);

  const handleAddToCart = async () => {
    if (!price && price !== null) return; // Only allow if price exists or is explicitly null (Sur devis)
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      setQuantity(1);
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="bg-gray-100 h-40 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p className="text-sm">{product.code}</p>
          <p className="text-xs mt-1">No image</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="flex justify-between items-center mb-4">
          {priceLoading ? (
            <p className="text-sm text-gray-500">Chargement du prix...</p>
          ) : price ? (
            <>
              <p className="text-xl font-bold text-blue-600">
                {price.currency} {parseFloat(price.amount).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">{price.currency}</p>
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-600">Prix sur devis</p>
          )}
        </div>

        {/* Error message */}
        {priceError && (
          <p className="text-xs text-red-500 mb-2">{priceError}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Qty:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={!price}
            />
          </div>

          <Button 
            onClick={handleAddToCart} 
            className="w-full"
            disabled={priceLoading || isAdding}
          >
            {isAdding ? 'Ajout...' : 'Add to Cart'}
          </Button>

          <Link href={`/shop/products/${product.id}`} className="block">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
