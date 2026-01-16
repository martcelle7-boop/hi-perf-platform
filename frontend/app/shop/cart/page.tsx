'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { createQuotationFromCart } from '@/lib/api/quotations';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, updateLine, removeLine, clearCart } = useCart();
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading cart...</p>
      </div>
    );
  }

  if (!cart || !cart.lines || cart.lines.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link href="/shop/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleUpdateQuantity = async (lineId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeLine(lineId);
    } else {
      await updateLine(lineId, newQuantity);
    }
  };

  const handleRemoveLine = async (lineId: number) => {
    await removeLine(lineId);
  };

  const handleCreateQuotation = async () => {
    setIsCreatingQuotation(true);
    setError(null);
    try {
      const response = await createQuotationFromCart();
      // Redirect to quotation detail page
      router.push(`/shop/checkout/${response.id}`);
    } catch (err: any) {
      console.error('Failed to create quotation:', err);
      setError(err.message || 'Failed to create quotation');
    } finally {
      setIsCreatingQuotation(false);
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subtotal</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.lines.map((line) => (
              <tr key={line.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{line.product?.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">{line.product?.code}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => handleUpdateQuantity(line.id, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  {line.unitPrice ? (
                    <p className="text-gray-900">
                      {line.currency} {parseFloat(line.unitPrice).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-gray-600">On request</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {line.unitPrice ? (
                    <p className="font-medium text-gray-900">
                      {line.currency}{' '}
                      {(parseFloat(line.unitPrice) * line.quantity).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-gray-600">On request</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleRemoveLine(line.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-900">Total:</p>
          <p className="text-2xl font-bold text-blue-600">
            {cart.currency} {parseFloat(cart.totalAmount || '0').toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {cart.lines.length} item(s) in cart
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4 justify-between">
        <div className="flex gap-4">
          <Link href="/shop/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Button variant="outline" onClick={handleClearCart} className="text-red-600">
            Clear Cart
          </Button>
        </div>
        <Button
          onClick={handleCreateQuotation}
          disabled={isCreatingQuotation}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreatingQuotation ? 'Creating quotation...' : 'Request Quotation'}
        </Button>
      </div>
    </div>
  );
}
