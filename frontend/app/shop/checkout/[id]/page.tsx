'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getQuotationById, acceptQuotation } from '@/lib/api/quotations';
import { createOrder } from '@/lib/api/orders';
import { Quotation } from '@/lib/types/quotation';
import { Button } from '@/components/ui/button';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        const data = await getQuotationById(params.id);
        setQuotation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load quotation');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotation();
  }, [params.id]);

  const handleAcceptAndOrder = async () => {
    if (!quotation) return;

    setIsProcessing(true);
    setError(null);
    try {
      // Accept the quotation
      await acceptQuotation(quotation.id);

      // Create order from quotation
      const order = await createOrder(quotation.id);

      // Redirect to payment page
      router.push(`/shop/orders/${order.id}/pay`);
    } catch (err: any) {
      console.error('Failed to process:', err);
      setError(err.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this quotation?')) return;
    // Rejection flow - could redirect back to cart or show confirmation
    router.push('/shop/cart');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading quotation...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-800">{error || 'Quotation not found'}</p>
        </div>
        <Link href="/shop/cart">
          <Button variant="outline">Back to Cart</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Review & Confirm Order</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quotation Summary</h2>

        {/* Quotation Details */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-600">Quotation ID</p>
              <p className="font-medium text-gray-900">{quotation.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium text-gray-900 capitalize">{quotation.status}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
          <div className="overflow-x-auto">
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
                {quotation.items.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="px-4 py-2">
                      <p className="font-medium">{line.product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-600">{line.product?.code}</p>
                    </td>
                    <td className="px-4 py-2 text-right">{line.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {line.unitPrice ? `${quotation.currency} ${String(line.unitPrice).includes('.') ? line.unitPrice : parseFloat(String(line.unitPrice)).toFixed(2)}` : 'TBD'}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {line.unitPrice ? `${quotation.currency} ${(parseFloat(String(line.unitPrice)) * line.quantity).toFixed(2)}` : 'TBD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="border-t mt-6 pt-6">
          <div className="flex justify-end gap-8">
            <div>
              <p className="text-gray-600 mb-2">Subtotal</p>
              <p className="text-gray-600 mb-2">Tax (if applicable)</p>
              <p className="text-lg font-bold text-gray-900 mt-4">Total</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900 mb-2">{quotation.currency} {String(quotation.totalAmount).includes('.') ? quotation.totalAmount : parseFloat(String(quotation.totalAmount)).toFixed(2)}</p>
              <p className="text-gray-900 mb-2">{quotation.currency} 0.00</p>
              <p className="text-lg font-bold text-blue-600 mt-4">{quotation.currency} {String(quotation.totalAmount).includes('.') ? quotation.totalAmount : parseFloat(String(quotation.totalAmount)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Terms checkbox */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" required />
          <span className="text-sm text-gray-700">
            I agree to the terms and conditions and authorize this purchase.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-between">
        <Button variant="outline" onClick={handleReject} disabled={isProcessing}>
          Reject Quotation
        </Button>
        <Button
          onClick={handleAcceptAndOrder}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? 'Processing...' : 'Accept & Proceed to Payment'}
        </Button>
      </div>
    </div>
  );
}
