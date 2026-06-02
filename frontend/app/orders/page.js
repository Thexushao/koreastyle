'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const statusLabel = {
  pending: '待確認',
  confirmed: '已確認',
  shipped: '已出貨',
  delivered: '已送達',
  cancelled: '已取消',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      orderApi.getMyOrders().then((r) => {
        setOrders(r.data);
        setLoading(false);
      });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (!authLoading && !user)
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm mb-4">請先登入查看訂單</p>
        <Link href="/auth/login" className="btn-primary inline-block">前往登入</Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-lg tracking-widest font-medium mb-8">我的訂單</h1>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-100 p-6">
              <div className="h-3 bg-gray-100 w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 w-1/4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400 text-sm">
          <p className="mb-4">還沒有任何訂單</p>
          <Link href="/products" className="btn-primary inline-block">開始購物</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`} className="block border border-gray-200 p-6 hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">訂單編號</p>
                  <p className="text-sm font-mono">{order._id}</p>
                </div>
                <span className={`text-xs px-3 py-1 ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[order.status]}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">{order.items.length} 件商品</span>
                <span className="font-medium">NT$ {(order.totalPrice + order.shippingFee).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(order.createdAt).toLocaleDateString('zh-TW')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
