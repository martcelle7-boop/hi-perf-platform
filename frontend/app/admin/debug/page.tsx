'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCatalog } from '@/lib/api/catalog';
import { getCart } from '@/lib/api/cart';
import { listOrders } from '@/lib/api/orders';

export default function AdminDebugPage() {
  const [token, setToken] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken ? `${storedToken.substring(0, 10)}...${storedToken.substring(storedToken.length - 10)}` : 'Not found');
  }, []);

  const runTest = async (name: string, fn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await fn();
      setTestResults((prev: any) => ({
        ...prev,
        [name]: { success: true, data: result },
      }));
    } catch (error: any) {
      setTestResults((prev: any) => ({
        ...prev,
        [name]: { success: false, error: error.message || 'Unknown error' },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Debug Page</h1>
      <p className="text-gray-600 mb-8">
        This page is for development and testing purposes only. It tests API connectivity and displays debug information.
      </p>

      {/* Environment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Environment Information</h2>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-blue-800">
              <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
            </p>
          </div>
          <div>
            <p className="text-blue-800">
              <strong>Auth Token:</strong> {token}
            </p>
          </div>
          <div>
            <p className="text-blue-800">
              <strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* API Tests */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Connectivity Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => runTest('catalog', () => getCatalog({ take: 5 }))}
            disabled={isLoading}
            className="w-full"
          >
            Test Catalog
          </Button>
          <Button
            onClick={() => runTest('cart', () => getCart())}
            disabled={isLoading}
            className="w-full"
          >
            Test Cart
          </Button>
          <Button
            onClick={() => runTest('orders', () => listOrders())}
            disabled={isLoading}
            className="w-full"
          >
            Test Orders
          </Button>
          <Button
            onClick={() => {
              setTestResults({});
            }}
            variant="outline"
            className="w-full"
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Test Results</h3>
            {Object.entries(testResults).map(([name, result]: [string, any]) => (
              <div
                key={name}
                className={`rounded p-4 ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="font-semibold mt-1">
                    {result.success ? (
                      <span className="text-green-700">✓ {name}</span>
                    ) : (
                      <span className="text-red-700">✗ {name}</span>
                    )}
                  </div>
                </div>
                <pre className="mt-2 text-xs overflow-x-auto bg-gray-900 text-gray-100 p-2 rounded">
                  {JSON.stringify(result.data || { error: result.error }, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentation */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Guide</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use these test buttons to verify API connectivity</li>
          <li>• Check the browser console (F12) for detailed error messages</li>
          <li>• Ensure the backend API is running on {process.env.NEXT_PUBLIC_API_URL}</li>
          <li>• Verify you are logged in (Auth token should be present)</li>
          <li>• Test results show API response structure and data</li>
        </ul>
      </div>
    </div>
  );
}
