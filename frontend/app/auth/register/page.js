'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('兩次密碼不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || '註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-center text-lg tracking-[0.3em] font-medium mb-10">REGISTER</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'name', label: '姓名', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: '密碼（至少 6 字元）', type: 'password' },
          { name: 'confirm', label: '確認密碼', type: 'password' },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? '處理中...' : '註冊'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        已有帳號？{' '}
        <Link href="/auth/login" className="text-gray-900 underline">立即登入</Link>
      </p>
    </div>
  );
}
