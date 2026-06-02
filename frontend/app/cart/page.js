'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { couponApi } from '@/lib/api';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, total, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validating, setValidating] = useState(false);

  const shippingFee = total >= 2000 ? 0 : 60;
  const discountAmount = coupon?.discountAmount || 0;
  const finalTotal = total + shippingFee - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError('');
    try {
      const { data } = await couponApi.validate(couponCode, total);
      setCoupon(data);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.response?.data?.message || '優惠券無效');
    } finally { setValidating(false); }
  };

  const handleRemoveCoupon = () => { setCoupon(null); setCouponCode(''); setCouponError(''); };

  if (cart.length === 0)
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm mb-6">購物車是空的</p>
        <Link href="/products" className="btn-primary inline-block">繼續購物</Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-lg tracking-widest font-medium mb-8">購物車</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.key} className="flex gap-4 border-b border-gray-100 pb-6">
              <div className="relative w-24 h-32 flex-shrink-0 bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.color} / {item.size}</p>
                <p className="text-sm mt-2">NT$ {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => updateQty(item.key, item.qty - 1)} className="px-3 py-1 text-gray-500 hover:bg-gray-50">−</button>
                    <span className="px-3 py-1 text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} className="px-3 py-1 text-gray-500 hover:bg-gray-50">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.key)} className="text-xs text-gray-400 hover:text-gray-700 underline">移除</button>
                </div>
              </div>
              <div className="text-sm font-medium">NT$ {(item.price * item.qty).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 h-fit space-y-4">
          <h2 className="text-sm tracking-widest font-medium">訂單摘要</h2>

          {/* 優惠券 */}
          <div>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 text-sm">
                <span className="text-green-700 font-mono font-medium">{coupon.code}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xs">-NT$ {discountAmount.toLocaleString()}</span>
                  <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="輸入優惠碼"
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
                <button onClick={handleApplyCoupon} disabled={validating}
                  className="border border-gray-900 text-gray-900 px-3 py-2 text-xs hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40">
                  {validating ? '...' : '套用'}
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between"><span>小計</span><span>NT$ {total.toLocaleString()}</span></div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>優惠折扣</span><span>-NT$ {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>運費</span><span>{shippingFee === 0 ? '免費' : `NT$ ${shippingFee}`}</span>
            </div>
            {shippingFee > 0 && <p className="text-xs text-gray-400">再消費 NT$ {(2000 - total).toLocaleString()} 可享免運</p>}
            <div className="border-t border-gray-200 pt-3 flex justify-between font-medium text-gray-900">
              <span>總計</span><span>NT$ {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <Link href={`/checkout${coupon ? `?coupon=${coupon.code}&discount=${discountAmount}` : ''}`}
            className="btn-primary w-full text-center block">前往結帳</Link>
          <button onClick={clearCart} className="w-full text-center text-xs text-gray-400 hover:text-gray-700">清空購物車</button>
        </div>
      </div>
    </div>
  );
}
