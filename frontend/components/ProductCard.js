import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product._id}`} className="group block">
      <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 tracking-wider">
            NEW
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-400 mb-1">{product.nameKo}</p>
        <h3 className="text-sm font-medium text-gray-900 group-hover:underline">{product.name}</h3>
        <p className="text-sm text-gray-700 mt-1">NT$ {product.price.toLocaleString()}</p>
        <div className="flex gap-1 mt-2">
          {product.colors.slice(0, 4).map((color) => (
            <span key={color} className="text-xs text-gray-400">{color}</span>
          )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep-${i}`} className="text-gray-200">·</span>, el], [])}
        </div>
      </div>
    </Link>
  );
}
