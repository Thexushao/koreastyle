'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { productApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productApi.getById(id).then((r) => {
      setProduct(r.data);
      setSelectedSize(r.data.sizes[0] || '');
      setSelectedColor(r.data.colors[0] || '');
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addToCart(product, selectedSize, selectedColor, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-100 aspect-[3/4]" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 w-1/2" />
            <div className="h-6 bg-gray-100 w-3/4" />
            <div className="h-4 bg-gray-100 w-1/3" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700 mb-8 flex items-center gap-1">
        ← 返回
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-[3/4] bg-gray-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 tracking-wider">NEW</span>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2">{product.nameKo}</p>
          <h1 className="text-2xl font-medium text-gray-900 mb-4">{product.name}</h1>
          <p className="text-xl text-gray-900 mb-6">NT$ {product.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">{product.description}</p>

          <div className="mb-6">
            <p className="text-sm font-medium mb-3">顏色</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2 text-sm border ${selectedColor === c ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-medium mb-3">尺寸</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 text-sm border ${selectedSize === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50">−</button>
              <span className="px-4 py-3 text-sm min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-50">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 text-sm tracking-widest transition-colors ${added ? 'bg-green-700 text-white' : 'btn-primary'}`}
            >
              {added ? '已加入購物車 ✓' : '加入購物車'}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-2 text-sm text-gray-400">
            <p>庫存：{product.stock > 0 ? `${product.stock} 件` : '已售完'}</p>
            <p>運費：NT$60（滿 NT$2,000 免運）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
