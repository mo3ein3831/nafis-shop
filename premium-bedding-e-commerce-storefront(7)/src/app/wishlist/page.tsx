"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { useCart } from "@/context/CartContext";
import { toPersianDigits } from "@/lib/format";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.error("Error loading wishlist products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <CartDrawer />
      <Toast />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-6 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900">لیست علاقه‌مندی‌های شما</h1>
            <p className="text-xs text-stone-500 font-medium">
              {toPersianDigits(wishlistedProducts.length)} کالا در لیست ذخیره شده است
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-bold text-stone-600">در حال بارگذاری لیست علاقه‌مندی‌ها...</div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-4 max-w-2xl mx-auto my-10">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-xl text-stone-800">لیست علاقه‌مندی‌های شما خالی است!</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              شما هنوز هیچ محصولی را به لیست علاقه‌مندی‌های خود اضافه نکرده‌اید. با کلیک بر روی نماد قلب روی کارت هر محصول، می‌توانید آن را برای بررسی و خرید بعدی ذخیره کنید.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-amber-800 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition shadow-md"
              >
                <span>مشاهده محصولات فروشگاه نفیس</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
