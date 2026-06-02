'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

const statusLabel = { pending: '待確認', confirmed: '已確認', shipped: '已出貨', delivered: '已送達', cancelled: '已取消' };
const statusColor = { pending: 'bg-yellow-50 text-yellow-700', confirmed: 'bg-blue-50 text-blue-700', shipped: 'bg-purple-50 text-purple-700', delivered: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600' };

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => { adminApi.getUserDetail(id).then((r) => setData(r.data)); }, [id]);

  if (!data) return <div className="p-8 text-gray-400 text-sm animate-pulse">載入中...</div>;

  const { user, orders, totalSpent } = data;

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700 mb-6 flex items-center gap-1">← 返回</button>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '姓名', value: user.name },
          { label: 'Email', value: user.email },
          { label: '電話', value: user.phone || '—' },
          { label: '訂單數', value: `${orders.length} 筆` },
          { label: '累計消費', value: `NT$ ${totalSpent.toLocaleString()}` },
          { label: '帳號狀態', value: user.isActive !== false ? '正常' : '已停用' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium mb-4">消費記錄</h2>
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['訂單編號', '商品', '金額', '狀態', '日期'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{o._id.slice(-8)}</td>
                <td className="px-5 py-3 text-gray-600 text-xs">{o.items.map((i) => `${i.name}×${i.qty}`).join('、')}</td>
                <td className="px-5 py-3">NT$ {(o.totalPrice + o.shippingFee).toLocaleString()}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[o.status]}`}>{statusLabel[o.status]}</span></td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('zh-TW')}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">尚無訂單記錄</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
