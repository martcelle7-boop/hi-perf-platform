'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
            <p><span className="font-medium">ID:</span> {user?.id}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Admin Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Manage Networks</li>
            <li>Manage Users</li>
            <li>View All Clients</li>
            <li>System Configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
