'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productApi } from '@/lib/api';
import { adminApi } from '@/lib/api';

const categoryLabel = {
  tops: '上衣', bottoms: '下著', dresses: '洋裝',
  outerwear: '外套', accessories: '配件',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = () => {
    productApi.getAll().then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`確定要刪除「${name}」嗎？`)) return;
    setDeleting(id);
    await adminApi.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setDeleting(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">商品管理</h1>
        <Link href="/admin/products/new" className="btn-primary inline-block text-sm px-4 py-2">
          + 新增商品
        </Link>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">商品</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">分類</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">售價</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">成本</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">毛利率</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">庫存</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-normal">標記</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 w-32" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 w-12" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 w-10" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 w-8" /></td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                  </tr>
                ))
              : products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-gray-100 flex-shrink-0">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.nameKo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{categoryLabel[p.category]}</td>
                    <td className="px-4 py-3">NT$ {p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-500">NT$ {(p.cost ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {p.cost > 0 && p.price > 0 ? (
                        <span className={`text-xs font-medium ${((p.price - p.cost) / p.price) >= 0.4 ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {(((p.price - p.cost) / p.price) * 100).toFixed(1)}%
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.stock < 5 ? 'text-red-500' : 'text-gray-700'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.isFeatured && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5">精選</span>}
                        {p.isNew && <span className="text-xs bg-gray-900 text-white px-2 py-0.5">NEW</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/admin/products/${p._id}`} className="text-xs text-blue-600 hover:underline">
                          編輯
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deleting === p._id}
                          className="text-xs text-red-500 hover:underline disabled:opacity-40"
                        >
                          {deleting === p._id ? '刪除中...' : '刪除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
