'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCatalogProduct } from '@/lib/api/catalog';
import { CatalogProduct } from '@/lib/types/catalog';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const { cart, addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getCatalogProduct(parseInt(params.id, 10));
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Don't allow adding ON_REQUEST products directly
    if (product.price?.kind === 'ON_REQUEST') {
      alert('Please request a quotation for this product');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setQuantity(1);
      alert('Product added to cart!');
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-800">{error || 'Product not found'}</p>
        </div>
        <Link href="/shop/products">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isPARTNER = product.type === 'PARTNER';
  const isONREQUEST = product.price?.kind === 'ON_REQUEST';
  const isNORMAL = !isPARTNER && !isONREQUEST;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/shop/products">
          <Button variant="outline">← Back to Catalog</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="font-semibold">{product.code}</p>
            <p className="text-sm">No image available</p>
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          {/* Type badge */}
          <div className="mb-4">
            {isPARTNER && (
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                Partner Product
              </span>
            )}
            {isONREQUEST && (
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
                Quote Required
              </span>
            )}
            {isNORMAL && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                In Stock
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4 leading-relaxed">
            {product.description}
          </p>

          {/* Price Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Price Information
            </h3>

            {product.price?.kind === 'NUMERIC' && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                <p className="text-3xl font-bold text-blue-600">
                  {product.price?.currency || ''} {parseFloat(product.price?.amount || '0').toFixed(2)}
                </p>
              </div>
            )}

            {product.price?.kind === 'TEXT' && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-lg text-gray-900">{product.priceDescription || 'Pricing information available on request'}</p>
              </div>
            )}

            {product.price?.kind === 'ON_REQUEST' && (
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  Price on Request
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {product.priceDescription || 'Contact our sales team for pricing'}
                </p>
              </div>
            )}
          </div>

          {/* Product Code */}
          <div className="text-sm text-gray-600 mb-4">
            <p><strong>Product Code:</strong> {product.code}</p>
          </div>

          {/* CTA Section */}
          <div className="border-t pt-6">
            {isPARTNER ? (
              <div className="space-y-3">
                {product.externalUrl && (
                  <a href={product.externalUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Discover on Partner Site</Button>
                  </a>
                )}
                <Link href="/shop/requests/new">
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            ) : isONREQUEST ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  This product requires a quotation request. Our team will contact you with pricing information.
                </p>
                <Link href="/shop/requests/new">
                  <Button className="w-full">Request Quote</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full"
                >
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            )}
          </div>

          {/* Cart Count */}
          {cart && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                Current cart: <strong>{cart.lines?.length || 0}</strong> items
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
