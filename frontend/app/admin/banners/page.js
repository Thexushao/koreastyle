'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { bannerApi } from '@/lib/api';

const empty = { image: '', tag: '', title: '', subtitle: '', ctaText: '立即選購', ctaHref: '/products', isActive: true };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(null);

  useEffect(() => { bannerApi.getAll().then((r) => setBanners(r.data)); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNew = () => { setForm(empty); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (b) => {
    setForm({ image: b.image, tag: b.tag, title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaHref: b.ctaHref, isActive: b.isActive });
    setEditId(b._id); setShowForm(true); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editId) {
        const { data } = await bannerApi.update(editId, form);
        setBanners((p) => p.map((b) => b._id === editId ? data : b));
      } else {
        const { data } = await bannerApi.create(form);
        setBanners((p) => [...p, data]);
      }
      setShowForm(false); setForm(empty); setEditId(null);
    } catch (err) { setError(err.response?.data?.message || '操作失敗'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此 Banner？')) return;
    await bannerApi.delete(id);
    setBanners((p) => p.filter((b) => b._id !== id));
  };

  const handleToggle = async (b) => {
    const { data } = await bannerApi.update(b._id, { ...b, isActive: !b.isActive });
    setBanners((p) => p.map((x) => x._id === b._id ? data : x));
  };

  // 拖曳排序
  const handleDragStart = (id) => setDragging(id);
  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragging === id) return;
    const from = banners.findIndex((b) => b._id === dragging);
    const to = banners.findIndex((b) => b._id === id);
    const next = [...banners];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setBanners(next);
  };
  const handleDragEnd = async () => {
    setDragging(null);
    await bannerApi.reorder(banners.map((b) => b._id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Banner 管理</h1>
          <p className="text-xs text-gray-400 mt-1">拖曳卡片可調整輪播順序</p>
        </div>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm">+ 新增 Banner</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded p-6 mb-6">
          <h2 className="text-sm font-medium mb-4">{editId ? '編輯 Banner' : '新增 Banner'}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">圖片 URL</label>
              <input name="image" value={form.image} onChange={handleChange} required
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              {form.image && (
                <div className="mt-2 relative h-28 w-full overflow-hidden rounded border border-gray-100">
                  <Image src={form.image} alt="preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">標籤文字（小字）</label>
              <input name="tag" value={form.tag} onChange={handleChange} placeholder="2024 SUMMER COLLECTION"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">主標題（可換行用 \n）</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="夏日韓風\n穿搭特輯"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">副標題</label>
              <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="描述文字"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">按鈕文字</label>
              <input name="ctaText" value={form.ctaText} onChange={handleChange}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">按鈕連結</label>
              <input name="ctaHref" value={form.ctaHref} onChange={handleChange} placeholder="/products"
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4" />
            啟用此 Banner（顯示在首頁）
          </label>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">{saving ? '儲存中...' : '儲存'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-5 py-2 text-sm">取消</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {banners.map((b, i) => (
          <div key={b._id}
            draggable
            onDragStart={() => handleDragStart(b._id)}
            onDragOver={(e) => handleDragOver(e, b._id)}
            onDragEnd={handleDragEnd}
            className={`bg-white border rounded overflow-hidden flex cursor-grab active:cursor-grabbing transition-shadow ${dragging === b._id ? 'shadow-lg opacity-60 border-gray-400' : 'border-gray-200 hover:border-gray-300'}`}>

            {/* 縮圖 */}
            <div className="relative w-48 h-28 flex-shrink-0 bg-gray-100">
              {b.image && <Image src={b.image} alt={b.title} fill className="object-cover" unoptimized />}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-white text-xl font-light opacity-80">#{i + 1}</span>
              </div>
            </div>

            {/* 內容 */}
            <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {b.tag && <p className="text-xs text-gray-400 mb-1">{b.tag}</p>}
                <p className="font-medium text-gray-900 truncate">{b.title.replace(/\\n/g, ' ')}</p>
                {b.subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{b.subtitle}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>按鈕：{b.ctaText}</span>
                  <span>→ {b.ctaHref}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={() => handleToggle(b)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${b.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {b.isActive ? '顯示中' : '已隱藏'}
                </button>
                <button onClick={() => openEdit(b)} className="text-xs text-blue-600 hover:underline">編輯</button>
                <button onClick={() => handleDelete(b._id)} className="text-xs text-red-500 hover:underline">刪除</button>
                <span className="text-gray-300 text-lg select-none">⠿</span>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm border border-dashed border-gray-200 rounded">
            尚無 Banner，點擊「新增 Banner」開始
          </div>
        )}
      </div>
    </div>
  );
}
