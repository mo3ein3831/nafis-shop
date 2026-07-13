"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Percent } from "lucide-react";
import { formatPrice, toPersianDigits } from "@/lib/format";

export function AmazingStrip({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const ends = products.map(p => p.amazingOfferEnd ? new Date(p.amazingOfferEnd).getTime() : 0).filter(Boolean);
    const target = ends.length ? Math.min(...ends) : Date.now() + 24 * 3600000;
    const tick = () => {
      const d = Math.max(0, target - Date.now());
      setT({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [products]);

  const scroll = (dir: "l" | "r") => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "l" ? 300 : -300, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #A0522D 0%, #8B5E3C 55%, #6B4226 100%)" }}>
        <div className="flex items-stretch">
          {/* Side panel (right in RTL) */}
          <div className="hidden sm:flex flex-col items-center justify-center gap-4 shrink-0 w-40 lg:w-48 p-5 text-white text-center">
            <h2 className="text-xl lg:text-2xl font-black leading-9">پیشنهاد<br />شگفت<br />انــگــیــز</h2>
            <div className="flex gap-1 dir-ltr font-black text-sm">
              <span className="bg-white text-[#A0522D] px-2 py-1 rounded-lg min-w-[32px]">{toPersianDigits(String(t.s).padStart(2, "0"))}</span>
              <span className="self-center">:</span>
              <span className="bg-white text-[#A0522D] px-2 py-1 rounded-lg min-w-[32px]">{toPersianDigits(String(t.m).padStart(2, "0"))}</span>
              <span className="self-center">:</span>
              <span className="bg-white text-[#A0522D] px-2 py-1 rounded-lg min-w-[32px]">{toPersianDigits(String(t.h).padStart(2, "0"))}</span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-white/70 flex items-center justify-center animate-pulse-glow">
              <Percent className="w-8 h-8" strokeWidth={3} />
            </div>
            <Link href="/shop?amazing=true" className="text-xs font-bold hover:underline flex items-center gap-1">
              مشاهده همه <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile header */}
          <div className="sm:hidden absolute" />

          {/* Products scroll */}
          <div className="relative flex-1 min-w-0 py-4 pl-4 group/strip">
            {/* Mobile mini header */}
            <div className="sm:hidden flex items-center justify-between px-2 pb-3 text-white">
              <span className="font-black text-sm flex items-center gap-1.5"><Percent className="w-4 h-4" /> پیشنهاد شگفت‌انگیز</span>
              <div className="flex gap-1 dir-ltr font-black text-[11px]">
                <span className="bg-white text-[#A0522D] px-1.5 py-0.5 rounded">{toPersianDigits(String(t.s).padStart(2, "0"))}</span>:
                <span className="bg-white text-[#A0522D] px-1.5 py-0.5 rounded">{toPersianDigits(String(t.m).padStart(2, "0"))}</span>:
                <span className="bg-white text-[#A0522D] px-1.5 py-0.5 rounded">{toPersianDigits(String(t.h).padStart(2, "0"))}</span>
              </div>
            </div>

            <button onClick={() => scroll("l")} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg text-[#6B4226] opacity-0 group-hover/strip:opacity-100 transition flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </button>

            <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
              {products.map(p => {
                const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : "";
                const disc = p.originalPrice && p.price < p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                return (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    className="snap-start shrink-0 w-40 sm:w-44 bg-white rounded-xl p-3 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#F5F0E8] mb-2.5">
                      <img src={img} alt={p.namePersian} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                    <p className="text-[11px] font-bold text-[#3B3228] line-clamp-2 leading-5 flex-1">{p.namePersian}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      {disc > 0 && <span className="bg-[#A0522D] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{toPersianDigits(disc)}٪</span>}
                      <div className="text-left flex-1">
                        {p.originalPrice && <span className="block text-[9px] text-[#8C8175] line-through">{toPersianDigits(p.originalPrice.toLocaleString())}</span>}
                        <span className="block text-[11px] font-black text-[#3B3228]">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {/* View-all card at the end */}
              <Link href="/shop?amazing=true" className="snap-start shrink-0 w-32 bg-white/15 backdrop-blur rounded-xl flex flex-col items-center justify-center gap-2 text-white font-bold text-xs hover:bg-white/25 transition">
                <span className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></span>
                مشاهده همه
              </Link>
            </div>

            <button onClick={() => scroll("r")} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg text-[#6B4226] opacity-0 group-hover/strip:opacity-100 transition flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
