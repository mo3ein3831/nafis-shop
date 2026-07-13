"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, toPersianDigits } from "@/lib/format";

export function GroupBox({ title, products, viewAllLink }: { title: string; products: any[]; viewAllLink: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "l" ? 300 : -300, behavior: "smooth" }); };

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-black text-[#3B3228]">{title}</h3>
        <Link href={viewAllLink} className="text-[#A0522D] text-xs font-bold flex items-center gap-1 hover:underline group">
          مشاهده همه <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Horizontal products */}
      <div className="relative group/box">
        <button onClick={() => scroll("l")} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-[#E2DACC] text-[#3B3228] opacity-0 group-hover/box:opacity-100 transition flex items-center justify-center hover:bg-[#7A8E72] hover:text-white">
          <ChevronRight className="w-4 h-4" />
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {products.map(p => {
            const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : "";
            const disc = p.originalPrice && p.price < p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
            return (
              <Link key={p.id} href={`/products/${p.slug}`}
                className="snap-start shrink-0 w-44 sm:w-48 border border-[#EBE4D8] rounded-xl p-3 flex flex-col hover:border-[#9AAF8E] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white">
                <div className="aspect-square rounded-lg overflow-hidden bg-[#F5F0E8] mb-2.5">
                  <img src={img} alt={p.namePersian} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
                <p className="text-[11px] font-bold text-[#3B3228] line-clamp-2 leading-5 flex-1">{p.namePersian}</p>
                <div className="mt-2.5 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {disc > 0 && <span className="bg-[#A0522D] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{toPersianDigits(disc)}٪</span>}
                    {p.originalPrice && <span className="text-[10px] text-[#8C8175] line-through">{toPersianDigits(p.originalPrice.toLocaleString())}</span>}
                  </div>
                  <span className="block text-xs font-black text-[#5C6F54]">{formatPrice(p.price)}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <button onClick={() => scroll("r")} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-[#E2DACC] text-[#3B3228] opacity-0 group-hover/box:opacity-100 transition flex items-center justify-center hover:bg-[#7A8E72] hover:text-white">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
