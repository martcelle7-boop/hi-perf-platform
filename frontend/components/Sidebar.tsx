'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/src/hooks/useCart';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();

  if (!user) return null;

  const navItems = [
    ...(user.role === 'ADMIN'
      ? [
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Networks', href: '/admin/networks' },
          { label: 'Users', href: '/admin/users' },
        ]
      : []),
    ...(user.role === 'BO'
      ? [
          { label: 'Business Dashboard', href: '/bo' },
          { label: 'Products', href: '/bo/products' },
          { label: 'Pricing', href: '/bo/pricing' },
        ]
      : []),
    ...(user.role === 'USER'
      ? [
          { label: 'Shop', href: '/shop' },
          { label: 'My Products', href: '/shop/products' },
          { label: 'Orders', href: '/shop/orders' },
          { label: 'Cart', href: '/shop/cart', badge: getCartItemCount() },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hi-Perf</h1>
        <p className="text-sm text-gray-400 mt-1">{user.role}</p>
      </div>

      <nav className="space-y-2 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 rounded hover:bg-gray-800 transition relative"
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="absolute right-4 top-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-700">
        <div className="mb-4 text-sm">
          <p className="text-gray-400">Logged in as</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <Button
          onClick={logout}
          variant="destructive"
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
