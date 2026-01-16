'use client';

import { useAuth } from '@/hooks/useAuth';

export default function BODashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Business Operations Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
            <p><span className="font-medium">Client ID:</span> {user?.clientId || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">BO Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Manage Products</li>
            <li>Set Pricing</li>
            <li>View Analytics</li>
            <li>Network Management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
