'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { orderApi } from '@/lib/api';

const statusLabel = {
  pending: '待確認',
  confirmed: '已確認',
  shipped: '已出貨',
  delivered: '已送達',
  cancelled: '已取消',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.getById(id).then((r) => setOrder(r.data));
  }, [id]);

  if (!order)
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-gray-400 text-sm">載入中...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-8 text-center">
          訂單已成功送出！感謝您的購買。
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg tracking-widest font-medium">訂單詳情</h1>
        <span className={`text-xs px-3 py-1 ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
          {statusLabel[order.status]}
        </span>
      </div>

      <div className="bg-gray-50 p-4 text-xs text-gray-500 mb-8 space-y-1">
        <p>訂單編號：<span className="font-mono">{order._id}</span></p>
        <p>下單時間：{new Date(order.createdAt).toLocaleString('zh-TW')}</p>
      </div>

      <div className="space-y-4 mb-8">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 border-b border-gray-100 pb-4">
            <div className="relative w-16 h-20 bg-gray-100 flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-400 mt-1">{item.color} / {item.size} × {item.qty}</p>
            </div>
            <p className="text-sm">NT$ {(item.price * item.qty).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="text-sm space-y-2 border-t border-gray-100 pt-4 mb-8">
        <div className="flex justify-between text-gray-600">
          <span>小計</span>
          <span>NT$ {order.totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>運費</span>
          <span>{order.shippingFee === 0 ? '免費' : `NT$ ${order.shippingFee}`}</span>
        </div>
        <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-100">
          <span>總計</span>
          <span>NT$ {(order.totalPrice + order.shippingFee).toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 text-sm space-y-1 mb-8">
        <p className="text-xs text-gray-400 mb-2">收件資訊</p>
        <p>{order.shippingAddress.name}｜{order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
        <p>{order.shippingAddress.street}</p>
        {order.note && <p className="text-gray-400 mt-2">備註：{order.note}</p>}
      </div>

      <Link href="/orders" className="btn-outline inline-block">返回訂單列表</Link>
    </div>
  );
}
