// src/components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext'; // Import the useCart hook
import { ShoppingBag, User, Search } from 'lucide-react'; // Import icons

export default function Header() {
  const { getCartItemCount } = useCart(); // Get the cart item count
  const itemCount = getCartItemCount();

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-black text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-8">
            <div className="flex items-center space-x-4">
              {/* Social Icons Placeholder */}
            </div>
            <a href="#" className="font-semibold underline hover:text-gray-300">
              SELL YOUR SHIRTS
            </a>
            <div className="flex items-center space-x-4">
              <span>Indonesia (IDR Rp)</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/">
                      <Image
                        src="/images/vocta-football-logo.png"
                        alt="VOCTA Football Logo"
                        width={150}
                        height={30}
                        priority
                      />
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="hidden md:flex md:space-x-8 font-semibold">
                    <Link href="#" className="text-black hover:text-red-600">Club Teams</Link>
                    <Link href="#" className="text-black hover:text-red-600">National Teams</Link>
                    <Link href="#" className="text-red-600 hover:text-red-700">Clearance</Link>
                    <Link href="#" className="text-black hover:text-red-600">Boots</Link>
                    <Link href="#" className="text-black hover:text-red-600">Training</Link>
                </nav>

                {/* Action Icons */}
                <div className="flex items-center space-x-4">
                    <a href="#" className="p-2 text-black hover:text-red-600"><User size={22} /></a>
                    <a href="#" className="p-2 text-black hover:text-red-600"><Search size={22} /></a>
                    <Link href="/cart" className="relative p-2 text-black hover:text-red-600">
                      <ShoppingBag size={22} />
                      {itemCount > 0 && (
                        <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-700 text-white text-xs flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
}