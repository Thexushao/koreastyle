'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: '儀表板', href: '/admin' },
  { label: '商品管理', href: '/admin/products' },
  { label: '訂單管理', href: '/admin/orders' },
  { label: '會員管理', href: '/admin/users' },
  { label: '優惠券', href: '/admin/coupons' },
  { label: '庫存管理', href: '/admin/inventory' },
  { label: 'Banner 管理', href: '/admin/banners' },
  { label: '進階報表', href: '/admin/reports' },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user?.isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <p className="text-xs tracking-widest text-gray-400 mb-1">KOREA STYLE</p>
          <p className="text-sm font-medium">管理後台</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-3 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-700">
          <Link href="/" className="text-xs text-gray-400 hover:text-white">
            ← 回到前台
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
