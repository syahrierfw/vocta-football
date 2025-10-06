// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext"; // Import CartProvider
import VoctaWidget from "../components/VoctaWidget"; // 1. Import the new VoctaWidget


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VOCTA Football Mania",
  description: "Your ultimate destination for AC Milan football jerseys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider> {/* Wrap your content with CartProvider */}
          <Header />
          {children}
          <Footer />
          <VoctaWidget /> {/* 2. Add the new VoctaWidget component here */}
        </CartProvider>
      </body>
    </html>
  );
}