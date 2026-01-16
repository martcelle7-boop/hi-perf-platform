'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ShopPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Shop</h1>
        <p className="text-lg text-gray-600 mb-8">
          Browse our collection of high-performance tech products
        </p>
        <Link href="/shop/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600 mb-2">6+</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
          <p className="text-gray-600">
            Curated selection of high-performance tech products
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600 mb-2">€</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Prices</h3>
          <p className="text-gray-600">
            Competitive pricing with free shipping on orders over €100
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-purple-600 mb-2">✓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Guaranteed</h3>
          <p className="text-gray-600">
            30-day returns policy and 1-year warranty on all products
          </p>
        </div>
      </div>
    </div>
  );
}
