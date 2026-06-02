'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { productApi, bannerApi } from '@/lib/api';

const categoryLinks = [
  { label: '上衣', en: 'TOPS', href: '/products?category=tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
  { label: '下著', en: 'BOTTOMS', href: '/products?category=bottoms', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
  { label: '洋裝', en: 'DRESSES', href: '/products?category=dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80' },
  { label: '外套', en: 'OUTERWEAR', href: '/products?category=outerwear', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80' },
];

function HeroBanner() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    bannerApi.getActive().then((r) => setSlides(r.data));
  }, []);

  const go = (idx) => setCurrent((idx + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length === 0) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [slides]);

  if (slides.length === 0)
    return <div className="w-full h-[85vh] min-h-[500px] bg-gray-100 animate-pulse" />;

  const slide = slides[current];

  return (
    <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden">
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <Image src={s.image} alt={s.tag} fill className="object-cover" priority={i === 0} sizes="100vw" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      <div className="relative h-full flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto">
        <p className="text-xs tracking-[0.4em] text-white/70 mb-4">{slide.tag}</p>
        <h1 className="text-4xl md:text-6xl font-light text-white leading-tight tracking-wider mb-6 whitespace-pre-line">
          {slide.title.replace(/\\n/g, '\n')}
        </h1>
        <p className="text-sm text-white/80 tracking-wider mb-10 max-w-sm">{slide.subtitle}</p>
        <Link href={slide.ctaHref} className="inline-block bg-white text-gray-900 px-8 py-3 text-sm tracking-widest hover:bg-gray-100 transition-colors w-fit">
          {slide.ctaText}
        </Link>
      </div>

      {/* 分頁點 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} />
        ))}
      </div>

      {/* 左右箭頭 */}
      <button onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl p-2">‹</button>
      <button onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl p-2">›</button>
    </section>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    productApi.getFeatured().then((r) => setFeatured(r.data));
    productApi.getNewArrivals().then((r) => setNewArrivals(r.data));
  }, []);

  return (
    <div>
      <HeroBanner />

      {/* Category 圖片卡 */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-xs tracking-[0.4em] text-gray-400 mb-10">SHOP BY CATEGORY</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryLinks.map((c) => (
            <Link key={c.href} href={c.href} className="group relative overflow-hidden aspect-[3/4]">
              <Image src={c.image} alt={c.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-white">
                <p className="text-xs tracking-[0.3em] text-white/70 mb-1">{c.en}</p>
                <p className="text-lg font-medium tracking-widest">{c.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm tracking-[0.3em] text-gray-900 font-medium">NEW ARRIVALS</h2>
              <p className="text-xs text-gray-400 mt-1">最新上架</p>
            </div>
            <Link href="/products?sort=newest" className="text-xs text-gray-500 hover:text-gray-900 underline">查看全部</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* 中段圖文 Banner */}
      <section className="my-12 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          <div className="relative aspect-[4/3] md:aspect-auto">
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"
              alt="Korean Fashion"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="bg-gray-900 text-white flex flex-col justify-center px-10 py-16">
            <p className="text-xs tracking-[0.4em] text-gray-400 mb-4">OUR STORY</p>
            <h2 className="text-3xl font-light tracking-wider leading-snug mb-6">
              韓流時尚，<br />從這裡開始
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-8">
              我們直接從韓國首爾精選當季最流行的服飾，<br />
              讓你不必飛出國，也能穿出道地的韓系風格。
            </p>
            <Link href="/products" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 inline-block w-fit">
              探索全系列
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm tracking-[0.3em] text-gray-900 font-medium">FEATURED</h2>
              <p className="text-xs text-gray-400 mt-1">本季精選</p>
            </div>
            <Link href="/products" className="text-xs text-gray-500 hover:text-gray-900 underline">查看全部</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* 底部 Banner */}
      <section className="relative h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
          alt="Free Shipping"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-xs tracking-[0.4em] text-white/70 mb-3">LIMITED OFFER</p>
          <h2 className="text-2xl md:text-3xl font-light tracking-widest mb-6">滿 NT$2,000 享免運費</h2>
          <Link href="/products" className="bg-white text-gray-900 px-8 py-2.5 text-sm tracking-widest hover:bg-gray-100 transition-colors">
            立即選購
          </Link>
        </div>
      </section>
    </div>
  );
}
