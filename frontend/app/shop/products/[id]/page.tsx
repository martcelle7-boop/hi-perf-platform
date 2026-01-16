'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/src/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useUserNetworkId } from '@/src/hooks/useUserNetworkId';
import { useRouter } from 'next/navigation';
import { Product } from '@/src/features/products/types';
import { getProductById, ProductsApiError } from '@/lib/api/products';
import { getEffectivePrice, EffectivePrice } from '@/lib/api/pricing';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated, token, isLoading } = useAuth();
  const { addToCart } = useCart();
  const { networkId } = useUserNetworkId();
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState<EffectivePrice | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch product if authenticated
    if (isAuthenticated && token) {
      const fetchProduct = async () => {
        try {
          setIsLoadingProduct(true);
          setError(null);
          const productId = parseInt(params.id, 10);
          const data = await getProductById(productId, token);
          setProduct(data);
        } catch (err) {
          if (err instanceof ProductsApiError) {
            if (err.status === 401) {
              router.push('/login');
            } else if (err.status === 404) {
              setError('Product not found');
            } else {
              setError('Failed to load product');
            }
          } else {
            setError('Failed to load product. Please try again.');
            console.error('Failed to fetch product:', err);
          }
        } finally {
          setIsLoadingProduct(false);
        }
      };

      fetchProduct();
    }
  }, [isAuthenticated, token, isLoading, params.id, router]);

  // Fetch effective price when product and networkId are available
  useEffect(() => {
    if (!product || !token || !networkId) {
      setPrice(null);
      return;
    }

    const fetchPrice = async () => {
      setIsLoadingPrice(true);
      setPriceError(null);
      try {
        const effectivePrice = await getEffectivePrice(product.id, networkId, token);
        setPrice(effectivePrice);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price';
        setPriceError(errorMessage);
        setPrice(null);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [product, networkId, token]);

  if (isLoading || isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        <Link href="/shop/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link href="/shop/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!price) return;
    addToCart({
      ...product!,
      price: { amount: parseFloat(price.amount), currency: price.currency },
    }, quantity);
    setQuantity(1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/shop/products" className="mb-6 inline-block">
        <Button variant="outline">← Back to Products</Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <p className="text-lg font-semibold">{product.code}</p>
            <p className="text-sm mt-2">No image available</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Product Code: {product.code}</p>
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div>
            {isLoadingPrice ? (
              <p className="text-sm text-gray-500">Chargement du prix...</p>
            ) : price ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-3xl font-bold text-blue-600">
                    {price.currency} {parseFloat(price.amount).toFixed(2)}
                  </p>
                  {price.isInherited && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      Hérité
                    </span>
                  )}
                </div>
                {price.note && (
                  <p className="text-sm text-gray-600 italic">
                    Note: {price.note}
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg font-semibold text-gray-600">Prix sur devis</p>
            )}
            {priceError && (
              <p className="text-sm text-red-500 mt-2">{priceError}</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center"
              />
            </div>

            <Button 
              onClick={handleAddToCart} 
              className="w-full h-12 text-lg"
              disabled={!price || isLoadingPrice}
            >
              {price ? 'Add to Cart' : 'Not Available'}
            </Button>

            <Button variant="outline" className="w-full h-12">
              <Link href="/shop/products" className="w-full">
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>✓ Free shipping on orders over €100</li>
              <li>✓ 30-day returns policy</li>
              <li>✓ 1-year warranty included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
