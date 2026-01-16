'use client';

import Link from 'next/link';
import { CatalogProduct } from '@/lib/types/catalog';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: CatalogProduct;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { type, price, externalUrl, priceDescription } = product;

  // Determine pricing display and CTA
  const isPriceable = price.kind === 'NUMERIC';
  const isOnRequest = price.kind === 'ON_REQUEST';
  const isPriceText = price.kind === 'TEXT';

  const renderCTA = () => {
    // PARTNER products
    if (type === 'PARTNER') {
      if (externalUrl) {
        return (
          <a href={externalUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full" variant="outline">
              Découvrir
            </Button>
          </a>
        );
      }
      return (
        <Link href={`/shop/requests/new?productId=${product.id}`}>
          <Button className="w-full" variant="outline">
            Contacter
          </Button>
        </Link>
      );
    }

    // ON_REQUEST products
    if (isOnRequest) {
      return (
        <Link href={`/shop/requests/new?productId=${product.id}`}>
          <Button className="w-full">
            Demander un devis
          </Button>
        </Link>
      );
    }

    // NORMAL products with numeric price
    if (isPriceable && onAddToCart) {
      return (
        <Button
          className="w-full"
          onClick={() => onAddToCart(product.id)}
        >
          Ajouter au panier
        </Button>
      );
    }

    // Fallback
    return (
      <Button className="w-full" disabled>
        Non disponible
      </Button>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image Placeholder */}
      <div className="w-full h-40 bg-gray-100 rounded-t-lg flex items-center justify-center">
        <span className="text-gray-400">Image</span>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Type badge */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {type}
          </span>
        </div>

        {/* Code */}
        <p className="text-xs text-gray-500">{product.code}</p>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Display */}
        <div className="border-t pt-3">
          {isPriceable && price.amount && (
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {price.amount}€
              </p>
              {price.isInherited && (
                <p className="text-xs text-blue-600">Prix hérité du réseau</p>
              )}
            </div>
          )}

          {isOnRequest && (
            <p className="text-lg font-semibold text-gray-600">
              Prix sur demande
            </p>
          )}

          {isPriceText && priceDescription && (
            <p className="text-sm text-gray-700">
              {priceDescription}
            </p>
          )}

          {type === 'PARTNER' && priceDescription && (
            <p className="text-sm text-gray-700">
              {priceDescription}
            </p>
          )}
        </div>

        {/* CTA */}
        <div>
          {renderCTA()}
        </div>

        {/* Link to detail */}
        <Link
          href={`/shop/products/${product.id}`}
          className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
        >
          Voir les détails
        </Link>
      </div>
    </div>
  );
}
