'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  date: string;
  total: number;
  items: number;
  status: 'pending' | 'shipped' | 'delivered';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading orders from localStorage or API
    setTimeout(() => {
      // Mock orders data
      const mockOrders: Order[] = [
        {
          id: 'ORD-2025-001',
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
          total: 1299.99,
          items: 1,
          status: 'shipped',
        },
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600 mt-2">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 mb-6">No orders yet</p>
          <Link href="/shop/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {order.id}
                </h3>
                <p className="text-sm text-gray-600">{order.date}</p>
                <p className="text-sm text-gray-600">
                  {order.items} item{order.items !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  €{order.total.toFixed(2)}
                </p>
                <p className={`text-sm font-medium mt-2 px-3 py-1 rounded-full inline-block ${
                  order.status === 'shipped'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-900 mb-2">
          ✓ Order Placed Successfully!
        </h2>
        <p className="text-green-800 mb-4">
          Thank you for your purchase. Your order has been placed and is being processed.
        </p>
        <Link href="/shop/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
