'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

const empty = { code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { adminApi.getCoupons().then((r) => setCoupons(r.data)); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (c) => {
    setForm({
      code: c.code, type: c.type, value: c.value, minOrder: c.minOrder,
      maxUses: c.maxUses, isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    });
    setEditId(c._id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 0, expiresAt: form.expiresAt || null };
      if (editId) {
        const { data } = await adminApi.updateCoupon(editId, payload);
        setCoupons((p) => p.map((c) => c._id === editId ? data : c));
      } else {
        const { data } = await adminApi.createCoupon(payload);
        setCoupons((p) => [data, ...p]);
      }
      setForm(empty); setEditId(null); setShowForm(false);
    } catch (err) { setError(err.response?.data?.message || '操作失敗'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`確定刪除優惠券「${code}」？`)) return;
    await adminApi.deleteCoupon(id);
    setCoupons((p) => p.filter((c) => c._id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">優惠券管理</h1>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(true); setError(''); }}
          className="btn-primary px-4 py-2 text-sm">+ 新增優惠券</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded p-6 mb-6">
          <h2 className="text-sm font-medium mb-4">{editId ? '編輯優惠券' : '新增優惠券'}</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">優惠碼</label>
              <input name="code" value={form.code} onChange={handleChange} required placeholder="SUMMER20"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400 uppercase" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">折扣類型</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                <option value="percentage">百分比折扣（%）</option>
                <option value="fixed">固定金額折扣（NT$）</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{form.type === 'percentage' ? '折扣比例（%）' : '折扣金額（NT$）'}</label>
              <input type="number" name="value" value={form.value} onChange={handleChange} required min="1"
                max={form.type === 'percentage' ? 100 : undefined}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最低訂單金額（NT$）</label>
              <input type="number" name="minOrder" value={form.minOrder} onChange={handleChange} min="0" placeholder="0 = 無限制"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">使用次數上限</label>
              <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange} min="0" placeholder="0 = 無限制"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">有效期限</label>
              <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4" />
            啟用此優惠券
          </label>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">{saving ? '儲存中...' : '儲存'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-5 py-2 text-sm">取消</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['優惠碼', '類型', '折扣', '最低金額', '已用/上限', '到期日', '狀態', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = c.expiresAt && new Date() > new Date(c.expiresAt);
              return (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3 text-gray-500">{c.type === 'percentage' ? '百分比' : '固定金額'}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{c.type === 'percentage' ? `${c.value}%` : `NT$${c.value}`}</td>
                  <td className="px-4 py-3 text-gray-500">{c.minOrder > 0 ? `NT$${c.minOrder}` : '無'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.usedCount} / {c.maxUses > 0 ? c.maxUses : '∞'}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.expiresAt ? (
                      <span className={expired ? 'text-red-500' : 'text-gray-500'}>
                        {new Date(c.expiresAt).toLocaleDateString('zh-TW')}
                      </span>
                    ) : <span className="text-gray-300">無期限</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive && !expired ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {!c.isActive ? '已停用' : expired ? '已過期' : '啟用中'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(c)} className="text-xs text-blue-600 hover:underline">編輯</button>
                      <button onClick={() => handleDelete(c._id, c.code)} className="text-xs text-red-500 hover:underline">刪除</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">尚無優惠券</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
