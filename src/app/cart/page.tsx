// src/app/cart/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

// The function must be exported as the default
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  const totalFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(getCartTotal());

  if (itemCount === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added any legendary shirts to your cart yet.</p>
        <Link href="/" className="bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-black">Your Cart ({itemCount} items)</h1>
        
        <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center py-6">
              <div className="w-24 h-24 rounded-md overflow-hidden mr-6">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-black">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.condition}</p>
                <p className="text-lg font-bold mt-2 text-black">{item.priceFormatted}</p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(String(item.id), parseInt(e.target.value))}
                  className="w-16 text-center border-gray-300 rounded-md"
                  min="1"
                />
                <button onClick={() => removeFromCart(String(item.id))} className="text-gray-500 hover:text-red-600">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <p className="text-2xl font-bold text-black">Total: {totalFormatted}</p>
          <p className="text-sm text-gray-500 mt-1">Shipping & taxes calculated at checkout.</p>
          <button className="mt-6 w-full sm:w-auto bg-black text-white font-semibold py-3 px-12 rounded-md hover:bg-gray-800">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}