'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productApi } from '@/lib/api';

const categoryLabels = {
  tops: '上衣', bottoms: '下著', dresses: '洋裝',
  outerwear: '外套', accessories: '配件',
};

const sortOptions = [
  { value: 'newest', label: '最新上架' },
  { value: 'price_asc', label: '價格低到高' },
  { value: 'price_desc', label: '價格高到低' },
];

function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [inputValue, setInputValue] = useState(searchQuery);

  // URL 的 search 參數改變時，同步輸入框
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    productApi.getAll({ category, sort, search: searchQuery }).then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
  }, [category, sort, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (inputValue.trim()) params.set('search', inputValue.trim());
    router.push(`/products?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setInputValue('');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-lg tracking-widest font-medium">
            {category ? categoryLabels[category] : searchQuery ? `「${searchQuery}」的搜尋結果` : '全部商品'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{loading ? '搜尋中...' : `${products.length} 件商品`}</p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="搜尋商品..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border border-gray-200 pl-3 pr-8 py-2 text-sm w-48 focus:outline-none focus:border-gray-400"
            />
            {inputValue && (
              <button type="button" onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 text-lg leading-none">
                ×
              </button>
            )}
          </form>

          <select value={sort} onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 搜尋標籤 */}
      {searchQuery && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-400">搜尋：</span>
          <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
            {searchQuery}
            <button onClick={handleClearSearch} className="ml-1 text-gray-400 hover:text-gray-700">×</button>
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[3/4]" />
              <div className="h-3 bg-gray-100 mt-3 w-3/4" />
              <div className="h-3 bg-gray-100 mt-2 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-sm mb-4">
            {searchQuery ? `找不到「${searchQuery}」相關商品` : '目前沒有符合條件的商品'}
          </p>
          {searchQuery && (
            <button onClick={handleClearSearch}
              className="text-xs text-gray-500 underline hover:text-gray-700">
              清除搜尋，查看全部商品
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-gray-400 text-sm">載入中...</div>}>
      <ProductList />
    </Suspense>
  );
}
