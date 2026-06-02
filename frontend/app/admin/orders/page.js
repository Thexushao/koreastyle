'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'pending', label: '待確認' },
  { value: 'confirmed', label: '已確認' },
  { value: 'shipped', label: '已出貨' },
  { value: 'delivered', label: '已送達' },
  { value: 'cancelled', label: '已取消' },
];

const statusColor = {
  pending: 'text-yellow-700 bg-yellow-50',
  confirmed: 'text-blue-700 bg-blue-50',
  shipped: 'text-purple-700 bg-purple-50',
  delivered: 'text-green-700 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    adminApi.getAllOrders().then((r) => {
      setOrders(r.data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    const { data } = await adminApi.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    setUpdating(null);
  };

  const filtered = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">訂單管理</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">篩選狀態：</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="">全部（{orders.length}）</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}（{orders.filter((o) => o.status === s.value).length}）
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded p-4 animate-pulse">
              <div className="h-3 bg-gray-100 w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">沒有符合條件的訂單</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded overflow-hidden">
              {/* 訂單標頭 */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">訂單編號</p>
                    <p className="font-mono text-xs text-gray-600">{order._id.slice(-12)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">會員</p>
                    <p className="text-sm font-medium">{order.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">訂購商品</p>
                    <p className="text-sm text-gray-700">
                      {order.items.map((item) => `${item.name} ×${item.qty}`).join('、')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.items.map((item) => `${item.color}/${item.size}`).join('、')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">金額</p>
                    <p className="text-sm font-medium">NT$ {(order.totalPrice + order.shippingFee).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {order.shippingFee === 0 ? '免運' : `含運 NT$${order.shippingFee}`}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-gray-400 mb-1">狀態</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className={`text-xs px-2 py-1 rounded border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${statusColor[order.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">日期</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('zh-TW')}</p>
                  </div>
                  <span className="text-gray-300 text-lg">{expanded === order._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* 展開：詳細商品 + 收件資訊 */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-5 grid grid-cols-2 gap-8">
                  {/* 商品明細 */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 tracking-wider mb-3">商品明細</p>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="relative w-12 h-16 bg-gray-200 flex-shrink-0 rounded overflow-hidden">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.color}／{item.size}　×{item.qty}</p>
                          </div>
                          <p className="text-sm text-gray-700 flex-shrink-0">
                            NT$ {(item.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-3 space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>小計</span>
                        <span>NT$ {order.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>運費</span>
                        <span>{order.shippingFee === 0 ? '免費' : `NT$ ${order.shippingFee}`}</span>
                      </div>
                      <div className="flex justify-between font-medium text-gray-800 pt-1 border-t border-gray-200">
                        <span>總計</span>
                        <span>NT$ {(order.totalPrice + order.shippingFee).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 收件資訊 */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 tracking-wider mb-3">收件資訊</p>
                    <div className="text-sm space-y-1.5 text-gray-700">
                      <p><span className="text-gray-400 text-xs w-16 inline-block">收件人</span>{order.shippingAddress.name}</p>
                      <p><span className="text-gray-400 text-xs w-16 inline-block">電話</span>{order.shippingAddress.phone}</p>
                      <p><span className="text-gray-400 text-xs w-16 inline-block">城市</span>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                      <p><span className="text-gray-400 text-xs w-16 inline-block">地址</span>{order.shippingAddress.street}</p>
                      {order.note && (
                        <p className="mt-2 bg-yellow-50 text-yellow-800 text-xs p-2 rounded">
                          備註：{order.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
