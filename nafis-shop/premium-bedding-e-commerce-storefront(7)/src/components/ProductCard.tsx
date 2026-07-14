"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { ShoppingBag, Heart, Star } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: number; slug: string; namePersian: string; nameEnglish: string;
    category: string; price: number; originalPrice: number | null;
    shortDescription: string; images: string[]; rating: number;
    reviewCount: number; isBestSeller: boolean; isNewArrival: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product.slug);
  const img = Array.isArray(product.images) && product.images[0] ? product.images[0] : "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80";
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const disc = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col relative hover:-translate-y-1">
      {/* Badge stack: show discount first, then new arrival below if needed */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1">
        {disc && disc > 0 && (
          <span className="bg-[#A0522D] text-white text-[10px] font-black px-2 py-0.5 rounded-lg leading-tight">
            {toPersianDigits(disc)}٪
          </span>
        )}
        {product.isNewArrival && (
          <span className="bg-[#5C6F54] text-white text-[9px] font-bold px-2 py-0.5 rounded-lg leading-tight">
            جدید
          </span>
        )}
      </div>
      
      <button onClick={() => toggleWishlist(product.slug)}
        className={`absolute top-2.5 left-2.5 z-10 p-1.5 rounded-full transition-all duration-300 ${inWishlist ? "bg-[#A0522D] text-white scale-110" : "bg-white/90 text-[#8C8175] hover:text-[#A0522D] hover:scale-110 shadow-sm"}`}>
        <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
      </button>

      <Link href={`/products/${product.slug}`} className="block aspect-square overflow-hidden bg-[#F5F0E8] relative">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E8] via-[#EBE4D8] to-[#F5F0E8] animate-pulse" />
        )}
        <img
          src={img}
          alt={product.namePersian}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </Link>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.slug}`} className="font-bold text-[#3B3228] text-[13px] line-clamp-2 leading-snug hover:text-[#5C6F54] transition block">
            {product.namePersian}
          </Link>
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3 h-3 text-[#A0522D] fill-current" />
            <span className="text-[11px] font-bold text-[#3B3228]">{toPersianDigits(product.rating)}</span>
            <span className="text-[10px] text-[#8C8175]">({toPersianDigits(product.reviewCount)})</span>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            {product.originalPrice && <span className="text-[10px] text-[#8C8175] line-through block">{formatPrice(product.originalPrice)}</span>}
            <span className="text-sm font-black text-[#3B3228]">{formatPrice(product.price)}</span>
          </div>
          <button onClick={() => addToCart(product)} title="افزودن به سبد"
            className="bg-[#7A8E72] hover:bg-[#5C6F54] text-white p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg">
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
