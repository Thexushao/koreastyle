'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const categories = [
  { label: '上衣', href: '/products?category=tops' },
  { label: '下著', href: '/products?category=bottoms' },
  { label: '洋裝', href: '/products?category=dresses' },
  { label: '外套', href: '/products?category=outerwear' },
  { label: '配件', href: '/products?category=accessories' },
];

function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative flex items-center">
      {open && (
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋商品..."
            className="w-48 md:w-64 border-b border-gray-400 bg-transparent text-sm py-1 pr-6 focus:outline-none placeholder-gray-400 transition-all"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="absolute right-6 text-gray-400 hover:text-gray-700 text-lg leading-none">
              ×
            </button>
          )}
        </form>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="搜尋"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-[0.3em] text-gray-900">
            KOREA STYLE
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {categories.map((c) => (
              <Link key={c.href} href={c.href}
                className="text-sm text-gray-600 hover:text-gray-900 tracking-wider transition-colors">
                {c.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SearchBar />

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {user.isAdmin && (
                  <Link href="/admin" className="text-sm bg-gray-900 text-white px-3 py-1 hover:bg-gray-700 transition-colors">
                    管理後台
                  </Link>
                )}
                <Link href="/orders" className="text-sm text-gray-600 hover:text-gray-900">訂單</Link>
                <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">登出</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">登入</Link>
                <Link href="/auth/register" className="text-sm text-gray-600 hover:text-gray-900">註冊</Link>
              </div>
            )}

            <Link href="/cart" className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-3">
            {categories.map((c) => (
              <Link key={c.href} href={c.href} className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>
                {c.label}
              </Link>
            ))}
            <hr className="border-gray-100" />
            {user ? (
              <>
                {user.isAdmin && (
                  <Link href="/admin" className="text-sm text-gray-700 py-1 font-medium" onClick={() => setMenuOpen(false)}>管理後台</Link>
                )}
                <Link href="/orders" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>訂單記錄</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-sm text-gray-700 py-1 text-left">登出</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>登入</Link>
                <Link href="/auth/register" className="text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>註冊</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
