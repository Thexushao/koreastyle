'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'tops', label: '上衣' },
  { value: 'bottoms', label: '下著' },
  { value: 'dresses', label: '洋裝' },
  { value: 'outerwear', label: '外套' },
  { value: 'accessories', label: '配件' },
];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ initialData, onSubmit, submitLabel = '儲存' }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData?.name || '',
    nameKo: initialData?.nameKo || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    cost: initialData?.cost || '',
    category: initialData?.category || 'tops',
    colors: initialData?.colors?.join('、') || '',
    sizes: initialData?.sizes || [],
    stock: initialData?.stock ?? '',
    images: initialData?.images?.join('\n') || '',
    isFeatured: initialData?.isFeatured || false,
    isNew: initialData?.isNew || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        colors: form.colors.split(/[、,，\n]/).map((c) => c.trim()).filter(Boolean),
        images: form.images.split('\n').map((u) => u.trim()).filter(Boolean),
      };
      await onSubmit(payload);
      router.push('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || '操作失敗，請重試');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">商品名稱（中文）</label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">商品名稱（韓文）</label>
          <input name="nameKo" value={form.nameKo} onChange={handleChange}
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">商品描述</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">售價（NT$）</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} required min="0"
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">成本（NT$）</label>
          <input type="number" name="cost" value={form.cost} onChange={handleChange} required min="0"
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          {form.price && form.cost && Number(form.price) > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              毛利率 {(((form.price - form.cost) / form.price) * 100).toFixed(1)}%
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">庫存數量</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">分類</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">顏色（用逗號或頓號分隔）</label>
        <input name="colors" value={form.colors} onChange={handleChange} placeholder="黑色、白色、米色"
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">尺寸</label>
        <div className="flex gap-2">
          {ALL_SIZES.map((s) => (
            <button key={s} type="button" onClick={() => toggleSize(s)}
              className={`w-12 h-10 text-sm border transition-colors ${form.sizes.includes(s) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">商品圖片 URL（每行一個）</label>
        <textarea name="images" value={form.images} onChange={handleChange} rows={3}
          placeholder="https://..."
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none font-mono" />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
            className="w-4 h-4" />
          精選商品
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange}
            className="w-4 h-4" />
          標記為新品
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? '處理中...' : submitLabel}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          取消
        </button>
      </div>
    </form>
  );
}
