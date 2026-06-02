'use client';
import ProductForm from '@/components/ProductForm';
import { adminApi } from '@/lib/api';

export default function NewProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-medium mb-8">新增商品</h1>
      <ProductForm
        onSubmit={(data) => adminApi.createProduct(data)}
        submitLabel="新增商品"
      />
    </div>
  );
}
