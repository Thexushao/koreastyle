'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { adminApi } from '@/lib/api';

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];
const TOP_PRODUCT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];
const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusLabel = { pending: '待確認', confirmed: '已確認', shipped: '已出貨', delivered: '已送達', cancelled: '已取消' };
const statusColor = { pending: 'text-yellow-700 bg-yellow-50', confirmed: 'text-blue-700 bg-blue-50', shipped: 'text-purple-700 bg-purple-50', delivered: 'text-green-700 bg-green-50', cancelled: 'text-red-600 bg-red-50' };

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}：{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [revenueView, setRevenueView] = useState('daily');

  useEffect(() => {
    adminApi.getDashboard().then((r) => setData(r.data));
  }, []);

  if (!data)
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white h-24 rounded border border-gray-200" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white h-64 rounded border border-gray-200" />)}
        </div>
      </div>
    );

  const stats = [
    { label: '商品總數', value: data.productCount, href: '/admin/products', note: '件商品', color: 'text-gray-900' },
    { label: '訂單總數', value: data.orderCount, href: '/admin/orders', note: '筆訂單', color: 'text-gray-900' },
    { label: '會員總數', value: data.userCount, href: '#', note: '位會員', color: 'text-gray-900' },
    { label: '累計營收', value: `NT$${data.revenue.toLocaleString()}`, href: '/admin/orders', note: '不含取消訂單', color: 'text-blue-600' },
    { label: '累計成本', value: `NT$${data.totalCost.toLocaleString()}`, href: '#', note: '已售商品進貨成本', color: 'text-red-500' },
    { label: '毛利', value: `NT$${data.grossProfit.toLocaleString()}`, href: '#', note: '營收 − 成本', color: data.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500' },
    { label: '毛利率', value: `${data.grossMargin}%`, href: '#', note: '毛利 ÷ 營收', color: data.grossMargin >= 40 ? 'text-emerald-600' : 'text-amber-500' },
  ];

  const chartRevenue = revenueView === 'daily' ? data.dailyRevenue : data.weeklyRevenue;
  const revenueKey = revenueView === 'daily' ? 'date' : 'label';

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-medium">儀表板</h1>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded border border-gray-200 p-5 hover:border-gray-400 transition-colors">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.note}</p>
          </Link>
        ))}
      </div>

      {/* 圖表區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 營收趨勢 */}
        <div className="bg-white border border-gray-200 rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">營收趨勢</h2>
            <div className="flex gap-1">
              {['daily', 'weekly'].map((v) => (
                <button key={v} onClick={() => setRevenueView(v)}
                  className={`text-xs px-3 py-1 transition-colors ${revenueView === v ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                  {v === 'daily' ? '近7天' : '近4週'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey={revenueKey} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip prefix="NT$" />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="revenue" name="營收" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="cost" name="成本" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="profit" name="毛利" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 訂單狀態圓餅圖 */}
        <div className="bg-white border border-gray-200 rounded p-5">
          <h2 className="text-sm font-medium mb-4">訂單狀態分佈</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={data.statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {data.statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} 筆`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statuses.map((s, i) => {
                const found = data.statusData.find((d) => d.name === statusLabel[s]);
                if (!found) return null;
                return (
                  <div key={s} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[i] }} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[s]}`}>{statusLabel[s]}</span>
                    </div>
                    <span className="text-sm font-medium">{found.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 熱賣商品 Top5 */}
        <div className="bg-white border border-gray-200 rounded p-5">
          <h2 className="text-sm font-medium mb-4">熱賣商品 Top 5（銷售數量）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalQty" name="銷售數量" radius={[0, 3, 3, 0]}>
                {data.topProducts.map((_, i) => (
                  <Cell key={i} fill={TOP_PRODUCT_COLORS[i % TOP_PRODUCT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 分類營收 */}
        <div className="bg-white border border-gray-200 rounded p-5">
          <h2 className="text-sm font-medium mb-4">分類營收（NT$）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip prefix="NT$" />} />
              <Bar dataKey="revenue" name="營收" radius={[3, 3, 0, 0]}>
                {data.categoryData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 最新訂單 */}
      <div className="bg-white rounded border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium">最新訂單</h2>
          <Link href="/admin/orders" className="text-xs text-gray-400 hover:text-gray-700 underline">查看全部</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['訂單編號', '會員', '商品', '金額', '狀態', '日期'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.map((order) => (
              <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{order._id.slice(-8)}</td>
                <td className="px-5 py-3">{order.user?.name || '—'}</td>
                <td className="px-5 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                  {order.items.map((i) => i.name).join('、')}
                </td>
                <td className="px-5 py-3">NT$ {(order.totalPrice + order.shippingFee).toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('zh-TW')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
