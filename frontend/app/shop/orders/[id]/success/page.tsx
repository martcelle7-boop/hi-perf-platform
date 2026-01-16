'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrder } from '@/lib/api/orders';
import { Order } from '@/lib/types/order';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(params.id);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="text-5xl font-bold text-green-600 mb-2">✓</div>
        </div>

        <h1 className="text-3xl font-bold text-green-900 mb-2">Payment Successful!</h1>
        <p className="text-green-800 mb-6">
          Thank you for your purchase. Your payment has been processed.
        </p>

        {order && (
          <div className="bg-white rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Confirmation</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-600">Order ID</p>
                <p className="font-medium text-gray-900">{order.id}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Amount Paid</p>
                <p className="font-bold text-gray-900">
                  {order.currency} {parseFloat(order.totalAmount || '0').toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Status</p>
                <p className="font-medium text-green-600">PAID</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6 text-sm">
          A confirmation email has been sent to your registered email address.
        </p>

        <div className="flex gap-4">
          <Link href="/shop/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/shop/orders" className="flex-1">
            <Button className="w-full">View My Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
