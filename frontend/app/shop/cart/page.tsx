'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuotation } from '@/src/hooks/useQuotation';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { quotation, isLoading: quotationLoading, removeItem } = useQuotation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login to view cart</h1>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  if (!quotation || quotation.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link href="/shop/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleRemoveItem = async (itemId: number) => {
    await removeItem(itemId);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      router.push('/shop/checkout');
    } catch (err) {
      console.error('Failed to proceed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Devis</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Prix Unitaire
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Sous-Total
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => {
                const unitPrice = item.unitPrice
                  ? parseFloat(item.unitPrice)
                  : null;
                const subtotal =
                  unitPrice !== null
                    ? (unitPrice * item.quantity).toFixed(2)
                    : null;

                return (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.product.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {unitPrice !== null ? (
                        <p className="text-gray-900">
                          {item.currency} {unitPrice.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">Sur devis</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {subtotal !== null ? (
                        <p className="font-medium text-gray-900">
                          {item.currency} {subtotal}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">Sur devis</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end items-center gap-4">
            <p className="text-lg font-semibold text-gray-900">Total estimé:</p>
            <p className="text-2xl font-bold text-blue-600">
              {quotation.currency} {parseFloat(quotation.totalAmount).toFixed(2)}
            </p>
          </div>
          {quotation.items.some((item) => item.unitPrice === null) && (
            <p className="text-sm text-gray-500 italic mt-2">
              * Prix final à confirmer après validation des articles "Sur devis"
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 justify-between">
        <Link href="/shop/products">
          <Button variant="outline">Continuer les achats</Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Chargement...' : 'Demander un devis'}
        </Button>
      </div>
    </div>
  );
}
