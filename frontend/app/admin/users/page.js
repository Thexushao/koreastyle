'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  const fetchUsers = (q = '') => {
    adminApi.getUsers({ search: q }).then((r) => { setUsers(r.data); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggle = async (id, name, isActive) => {
    if (!confirm(`確定要${isActive ? '停用' : '啟用'}「${name}」的帳號？`)) return;
    setToggling(id);
    const { data } = await adminApi.toggleUserStatus(id);
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.isActive } : u));
    setToggling(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">會員管理</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋姓名或 Email..."
            className="border border-gray-200 px-3 py-2 text-sm w-56 focus:outline-none focus:border-gray-400" />
          <button type="submit" className="btn-primary px-4 py-2 text-sm">搜尋</button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['姓名', 'Email', '註冊日期', '身份', '狀態', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3"><div className="h-3 bg-gray-100 w-24" /></td>
                  ))}
                </tr>
              ))
            ) : users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('zh-TW')}</td>
                <td className="px-5 py-3">
                  {u.isAdmin
                    ? <span className="text-xs bg-gray-900 text-white px-2 py-0.5">管理員</span>
                    : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5">會員</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {u.isActive !== false ? '正常' : '已停用'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/users/${u._id}`} className="text-xs text-blue-600 hover:underline">詳情</Link>
                    {!u.isAdmin && (
                      <button onClick={() => handleToggle(u._id, u.name, u.isActive !== false)}
                        disabled={toggling === u._id}
                        className={`text-xs hover:underline disabled:opacity-40 ${u.isActive !== false ? 'text-red-500' : 'text-emerald-600'}`}>
                        {toggling === u._id ? '處理中...' : u.isActive !== false ? '停用' : '啟用'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">找不到會員</div>
        )}
      </div>
    </div>
  );
}
