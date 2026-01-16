'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrder } from '@/lib/api/orders';
import { Order } from '@/lib/types/order';
import { Button } from '@/components/ui/button';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(params.id);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
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

  if (error || !order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-800">{error || 'Order not found'}</p>
        </div>
        <Link href="/shop/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <Link href="/shop/orders">
          <Button variant="outline">← Back to Orders</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-gray-600 text-sm">Order ID</p>
            <p className="font-medium text-gray-900">{order.id}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Order Date</p>
            <p className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Number of Items</p>
            <p className="font-medium text-gray-900">{order.lines?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Currency</p>
            <p className="font-medium text-gray-900">{order.currency}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Items</h2>
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.lines?.map((line) => (
                  <tr key={line.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <p className="font-medium">{line.productName || 'Product'}</p>
                      <p className="text-xs text-gray-600">{line.productCode}</p>
                    </td>
                    <td className="px-4 py-2 text-right">{line.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {order.currency} {parseFloat(line.unitPrice || '0').toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {order.currency} {(parseFloat(line.unitPrice || '0') * line.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-gray-50 rounded p-4 mb-6">
          <div className="flex justify-end gap-8">
            <div>
              <p className="text-gray-600 text-sm">Subtotal</p>
              <p className="text-gray-600 text-sm">Tax</p>
              <p className="text-lg font-bold text-gray-900 mt-2">Total</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900 text-sm">{order.currency} {parseFloat(order.totalAmount || '0').toFixed(2)}</p>
              <p className="text-gray-900 text-sm">{order.currency} 0.00</p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                {order.currency} {parseFloat(order.totalAmount || '0').toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {order.payment && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-medium text-gray-900">{order.payment.provider || 'Stripe'}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <p
                  className={`font-medium ${
                    order.payment.status === 'COMPLETED' || order.payment.status === 'REFUNDED'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {order.payment.status?.toUpperCase() || 'PENDING'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {order.status === 'PENDING_PAYMENT' && (
        <div className="flex gap-4">
          <Link href={`/shop/orders/${order.id}/pay`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Proceed to Payment
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
