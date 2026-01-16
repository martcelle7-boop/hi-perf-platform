'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuotation } from '@/hooks/useQuotation';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { quotation, isLoading: quotationLoading, submitQuotation } = useQuotation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || quotationLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login</h1>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  if (!quotation || quotation.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your quotation is empty</h1>
        <Link href="/shop/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitQuotation();
      router.push('/shop/orders');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quotation';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Demande de Devis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>
              <div className="space-y-3">
                {quotation.items.map((item) => {
                  const unitPrice = item.unitPrice
                    ? typeof item.unitPrice === 'string'
                      ? parseFloat(item.unitPrice)
                      : item.unitPrice
                    : null;
                  const subtotal =
                    unitPrice !== null
                      ? (unitPrice * item.quantity).toFixed(2)
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-3 border-b border-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product?.name || item.productName} x {item.quantity}
                        </p>
                        <p className="text-xs text-gray-500">{item.product?.code || item.productCode}</p>
                      </div>
                      <div className="text-right">
                        {unitPrice !== null ? (
                          <p className="text-sm font-medium text-gray-900">
                            {item.currency} {subtotal}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Sur devis</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
            </Button>

            <Link href="/shop/cart">
              <Button variant="outline" className="w-full">
                Retour au panier
              </Button>
            </Link>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900">Récapitulatif</h2>

            <div className="space-y-2 max-h-64 overflow-y-auto border-b border-gray-200 pb-4">
              {quotation.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="text-gray-600">
                    <p>{item.product?.name || item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {item.unitPrice
                      ? `${item.currency} ${(
                          (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice) * item.quantity
                        ).toFixed(2)}`
                      : 'Sur devis'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total estimé:</span>
              <span className="text-blue-600">
                {quotation.currency} {String(quotation.totalAmount).includes('.')
                  ? quotation.totalAmount
                  : parseFloat(String(quotation.totalAmount)).toFixed(2)}
              </span>
            </div>

            {quotation.items.some((item) => item.unitPrice === null) && (
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                <p>✓ Prix final après validation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
