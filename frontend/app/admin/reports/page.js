'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { adminApi } from '@/lib/api';

const HOUR_COLORS = Array.from({ length: 24 }, (_, i) => {
  if (i >= 9 && i <= 12) return '#6366f1';
  if (i >= 19 && i <= 22) return '#8b5cf6';
  if (i >= 0 && i <= 5) return '#e5e7eb';
  return '#93c5fd';
});

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { adminApi.getSummaryReport().then((r) => setData(r.data)); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportOrders();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url; a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  if (!data) return <div className="p-8 text-gray-400 text-sm animate-pulse">載入中...</div>;

  const kpis = [
    { label: '平均客單價', value: `NT$ ${data.avgOrderValue.toLocaleString()}` },
    { label: '回購率', value: `${data.repurchaseRate}%`, note: `${data.repeatBuyers} 位回購 / ${data.totalBuyers} 位買家` },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">進階報表</h1>
        <button onClick={handleExport} disabled={exporting}
          className="btn-outline px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50">
          {exporting ? '匯出中...' : '匯出訂單 CSV'}
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-gray-200 rounded p-5">
            <p className="text-xs text-gray-400 mb-1">{k.label}</p>
            <p className="text-2xl font-medium text-gray-900">{k.value}</p>
            {k.note && <p className="text-xs text-gray-400 mt-1">{k.note}</p>}
          </div>
        ))}
      </div>

      {/* 近 6 個月營收 */}
      <div className="bg-white border border-gray-200 rounded p-5">
        <h2 className="text-sm font-medium mb-4">近 6 個月營收趨勢</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `NT$ ${v.toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" name="營收" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 各時段銷售熱度 */}
      <div className="bg-white border border-gray-200 rounded p-5">
        <h2 className="text-sm font-medium mb-1">各時段下單熱度（24 小時）</h2>
        <p className="text-xs text-gray-400 mb-4">深紫色 = 上午尖峰，淺紫色 = 晚間尖峰，灰色 = 深夜離峰</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.hourly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v) => v.endsWith(':00') ? v.replace(':00', '') : ''} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
            <Tooltip formatter={(v) => `${v} 筆`} labelFormatter={(l) => `${l} 時段`} />
            <Bar dataKey="orders" name="訂單數" radius={[2, 2, 0, 0]}>
              {data.hourly.map((_, i) => <Cell key={i} fill={HOUR_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 說明 */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-500 space-y-1">
        <p><strong>平均客單價</strong> = 總營收 ÷ 有效訂單數（不含取消）</p>
        <p><strong>回購率</strong> = 有超過 1 筆訂單的買家 ÷ 所有有訂單的買家</p>
        <p><strong>匯出 CSV</strong> 包含：訂單編號、會員、商品、金額、狀態、下單時間</p>
      </div>
    </div>
  );
}
