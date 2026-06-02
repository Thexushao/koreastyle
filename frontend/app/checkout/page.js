'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/lib/api';
import Link from 'next/link';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams.get('coupon') || '';
  const discountAmount = Number(searchParams.get('discount')) || 0;
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '', postalCode: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = total >= 2000 ? 0 : 60;
  const finalTotal = total + shippingFee - discountAmount;

  if (!user)
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 text-sm mb-4">請先登入才能結帳</p>
        <Link href="/auth/login" className="btn-primary inline-block">前往登入</Link>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm mb-4">購物車是空的</p>
        <Link href="/products" className="btn-primary inline-block">繼續購物</Link>
      </div>
    );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const items = cart.map(({ product, name, image, price, size, color, qty }) => ({
        product, name, image, price, size, color, qty,
      }));
      const { data } = await orderApi.create({
        items,
        shippingAddress: { name: form.name, phone: form.phone, street: form.street, city: form.city, postalCode: form.postalCode },
        note: form.note,
        coupon: couponCode ? { code: couponCode, discountAmount } : undefined,
      });
      clearCart();
      router.push(`/orders/${data._id}?success=1`);
    } catch (err) {
      setError(err.response?.data?.message || '送出訂單失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-lg tracking-widest font-medium mb-8">結帳</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <h2 className="text-sm tracking-widest text-gray-400 mb-4">收件資訊</h2>
          {[
            { name: 'name', label: '收件人姓名', placeholder: '王小明' },
            { name: 'phone', label: '聯絡電話', placeholder: '09xxxxxxxx' },
            { name: 'city', label: '城市', placeholder: '台北市' },
            { name: 'postalCode', label: '郵遞區號', placeholder: '100' },
            { name: 'street', label: '詳細地址', placeholder: '中正區XX路XX號XX樓' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-600 mb-1">備註（選填）</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? '處理中...' : '確認下單'}
          </button>
        </form>

        <div className="bg-gray-50 p-6 h-fit">
          <h2 className="text-sm tracking-widest font-medium mb-4">訂單明細</h2>
          <div className="space-y-3 text-sm text-gray-600">
            {cart.map((item) => (
              <div key={item.key} className="flex justify-between">
                <span>{item.name} × {item.qty}<br /><span className="text-xs text-gray-400">{item.color} / {item.size}</span></span>
                <span>NT$ {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span>運費</span>
              <span>{shippingFee === 0 ? '免費' : `NT$ ${shippingFee}`}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>優惠折扣（{couponCode}）</span>
                <span>-NT$ {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-gray-900">
              <span>總計</span>
              <span>NT$ {finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-gray-400 text-sm">載入中...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
