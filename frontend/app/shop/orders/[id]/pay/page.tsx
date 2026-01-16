'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrder } from '@/lib/api/orders';
import { createCheckoutSession } from '@/lib/api/payments';
import { Order } from '@/lib/types/order';
import { Button } from '@/components/ui/button';

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleCheckout = async () => {
    if (!order) return;

    setIsProcessing(true);
    setError(null);
    try {
      const successUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/orders/${order.id}/success`;
      const cancelUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/orders/${order.id}`;

      const session = await createCheckoutSession(order.id, successUrl, cancelUrl);

      // Redirect to Stripe checkout
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      } else if (session.sessionId) {
        // Fallback: use Stripe's redirect method if available
        window.location.href = `https://checkout.stripe.com/pay/${session.sessionId}`;
      }
    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (order.payment?.status === 'COMPLETED' || order.payment?.status === 'REFUNDED') {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-green-900 mb-2">✓ Payment Complete</h1>
          <p className="text-green-800 mb-6">This order has already been paid.</p>
          <Link href={`/shop/orders/${order.id}`}>
            <Button>View Order Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Payment</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Order Summary */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <p className="text-gray-600">Order ID</p>
              <p className="font-medium text-gray-900">{order.id}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Items</p>
              <p className="font-medium text-gray-900">{order.lines?.length || 0}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Total Amount</p>
              <p className="font-bold text-blue-600">
                {order.currency} {parseFloat(order.totalAmount || '0').toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="bg-blue-50 rounded p-4">
            <p className="text-sm text-blue-900">
              <strong>Stripe Secure Payment</strong>
            </p>
            <p className="text-xs text-blue-800 mt-2">
              You will be redirected to a secure Stripe checkout page to complete your payment.
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-6">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" required />
            <span className="text-sm text-gray-700">
              I acknowledge the order total of <strong>{order.currency} {parseFloat(order.totalAmount || '0').toFixed(2)}</strong> and agree to pay via Stripe.
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href={`/shop/orders/${order.id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? 'Processing...' : `Pay ${order.currency} ${parseFloat(order.totalAmount || '0').toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
