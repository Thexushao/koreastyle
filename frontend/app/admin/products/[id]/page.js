'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { productApi, adminApi } from '@/lib/api';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productApi.getById(id).then((r) => setProduct(r.data));
  }, [id]);

  if (!product)
    return (
      <div className="p-8 animate-pulse">
        <div className="h-5 bg-gray-100 w-32 mb-8" />
        <div className="space-y-4 max-w-2xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <h1 className="text-xl font-medium mb-8">編輯商品</h1>
      <ProductForm
        initialData={product}
        onSubmit={(data) => adminApi.updateProduct(id, data)}
        submitLabel="儲存變更"
      />
    </div>
  );
}
