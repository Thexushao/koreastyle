import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold tracking-widest mb-4">KOREA STYLE</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              精選韓國流行服飾，<br />為你打造最時尚的穿搭風格。
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wider mb-4">商品分類</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/products?category=tops" className="hover:text-gray-900">上衣</Link></li>
              <li><Link href="/products?category=bottoms" className="hover:text-gray-900">下著</Link></li>
              <li><Link href="/products?category=dresses" className="hover:text-gray-900">洋裝</Link></li>
              <li><Link href="/products?category=outerwear" className="hover:text-gray-900">外套</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wider mb-4">顧客服務</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/orders" className="hover:text-gray-900">訂單查詢</Link></li>
              <li><span>配送費用：NT$60</span></li>
              <li><span>客服信箱：service@koreastyle.com</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-400">
          © 2024 KOREA STYLE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
