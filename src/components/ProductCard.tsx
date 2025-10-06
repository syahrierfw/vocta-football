// src/components/ProductCard.tsx
'use client';

import { Product } from '@/data/products';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext'; // Import the useCart hook

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart(); // Get the addToCart function from our context

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="overflow-hidden rounded-lg bg-gray-100 border border-gray-200 aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover object-center w-full h-full group-hover:opacity-80 transition-opacity"
          />
        </div>
      </Link>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-bold text-black">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Condition: {product.condition}
        </p>
        <p className="mt-2 text-xl font-extrabold text-black">
          {product.priceFormatted}
        </p>
      </div>
      {/* Add the onClick handler to the button */}
      
    </div>
  );
}