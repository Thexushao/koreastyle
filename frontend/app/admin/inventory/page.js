'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ change: '', reason: '' });
  const [tab, setTab] = useState('stock');

  const fetchData = () => {
    Promise.all([
      adminApi.getLowStock(threshold),
      adminApi.getStockLogs(),
    ]).then(([p, l]) => {
      setProducts(p.data);
      setLogs(l.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [threshold]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await adminApi.adjustStock(adjusting._id, {
        change: Number(adjustForm.change),
        reason: adjustForm.reason,
      });
      setAdjusting(null);
      setAdjustForm({ change: '', reason: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || '調整失敗'); }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-medium mb-6">庫存管理</h1>

      <div className="flex gap-2 mb-6">
        {['stock', 'logs'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm transition-colors ${tab === t ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {t === 'stock' ? '低庫存警示' : '調整記錄'}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-500">警示閾值：庫存低於</label>
            <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} min="1"
              className="w-20 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400" />
            <label className="text-sm text-gray-500">件時顯示</label>
            <span className="text-sm text-gray-400 ml-2">（共 {products.length} 件商品需注意）</span>
          </div>

          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['商品', '分類', '目前庫存', '狀態', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-5 py-3"><div className="h-3 bg-gray-100 w-20" /></td>)}
                  </tr>
                )) : products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-gray-100 flex-shrink-0">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{p.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-lg font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-yellow-600'}`}>
                        {p.stock}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">件</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock <= 5 ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-700'}`}>
                        {p.stock === 0 ? '已售完' : p.stock <= 5 ? '庫存極低' : '庫存偏低'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => { setAdjusting(p); setAdjustForm({ change: '', reason: '' }); }}
                        className="text-xs text-blue-600 hover:underline">調整庫存</button>
                    </td>
                  </tr>
                ))}
                {!loading && products.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">所有商品庫存正常</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'logs' && (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['商品', '異動', '前→後', '原因', '操作者', '時間'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-medium">{log.productName}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${log.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{log.previousStock} → {log.newStock}</td>
                  <td className="px-5 py-3 text-gray-500">{log.reason}</td>
                  <td className="px-5 py-3 text-gray-400">{log.operator?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString('zh-TW')}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">尚無調整記錄</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* 調整庫存 Modal */}
      {adjusting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-sm mx-4">
            <h2 className="text-sm font-medium mb-1">調整庫存</h2>
            <p className="text-xs text-gray-400 mb-4">{adjusting.name}（目前：{adjusting.stock} 件）</p>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">異動數量（正數為增加，負數為扣除）</label>
                <input type="number" value={adjustForm.change}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, change: e.target.value }))}
                  required placeholder="例：+50 或 -10"
                  className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">原因</label>
                <input value={adjustForm.reason}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, reason: e.target.value }))}
                  required placeholder="例：補貨、盤點損耗"
                  className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 py-2 text-sm">確認</button>
                <button type="button" onClick={() => setAdjusting(null)} className="btn-outline flex-1 py-2 text-sm">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
