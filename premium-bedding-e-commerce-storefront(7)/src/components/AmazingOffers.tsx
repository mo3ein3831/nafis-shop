"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { toPersianDigits } from "@/lib/format";
import { ArrowLeft, Clock, Zap, ChevronLeft, ChevronRight } from "lucide-react";

export function AmazingOffers({ products, targetDate }: { products: any[]; targetDate?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [activeProducts, setActiveProducts] = useState<any[]>([]);

  useEffect(() => {
    const valid = products.filter((p) => !p.amazingOfferEnd || new Date(p.amazingOfferEnd).getTime() > Date.now());
    setActiveProducts(valid);
  }, [products]);

  useEffect(() => {
    const productEndTimes = activeProducts
      .map(p => p.amazingOfferEnd ? new Date(p.amazingOfferEnd).getTime() : 0)
      .filter(Boolean);
    const fallback = Date.now() + 24 * 3600000;
    const target = targetDate ? new Date(targetDate).getTime() : (productEndTimes.length ? Math.min(...productEndTimes) : fallback);
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, activeProducts]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? scrollRef.current.clientWidth * 0.75 : -scrollRef.current.clientWidth * 0.75, behavior: "smooth" });
  };

  if (activeProducts.length === 0) return null;

  return (
    <section className="bg-[#EBE4D8] py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-[#6B4226] p-2 rounded-xl"><Zap className="w-5 h-5 text-[#F6D56F] fill-[#F6D56F]" /></div>
            <div><h2 className="text-lg sm:text-xl font-black text-[#3B3228]">پیشنهاد شگفت‌انگیز</h2><p className="text-xs text-[#6B4226]">تخفیف‌های ویژه و محدود</p></div>
          </div>
          <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-[#6B4226]" />
            <div className="flex gap-1 dir-ltr tabular text-[#3B3228] font-black text-sm">
              <span className="bg-[#6B4226] text-white px-1.5 py-0.5 rounded">{toPersianDigits(String(timeLeft.s).padStart(2, "0"))}</span>
              <span>:</span><span className="bg-[#6B4226] text-white px-1.5 py-0.5 rounded">{toPersianDigits(String(timeLeft.m).padStart(2, "0"))}</span>
              <span>:</span><span className="bg-[#6B4226] text-white px-1.5 py-0.5 rounded">{toPersianDigits(String(timeLeft.h).padStart(2, "0"))}</span>
            </div>
          </div>
          <Link href="/shop?sort=price_asc" className="text-[#6B4226] text-xs font-bold flex items-center gap-1 hover:underline">مشاهده همه <ArrowLeft className="w-3.5 h-3.5" /></Link>
        </div>

        <div className="relative group">
          <button onClick={() => scroll("left")} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md text-[#3B3228] opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {activeProducts.map(p => {
              const discount = p.originalPrice && p.price < p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              const stock = Number(p.stock ?? 0);
              const stockPercent = stock > 0 ? Math.max(10, Math.min(100, Math.round((stock / 100) * 100))) : 18;
              return (
                <div key={p.id} className="snap-start shrink-0 w-[72vw] sm:w-[42vw] md:w-[29vw] lg:w-[22vw] xl:w-[19vw]">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm relative">
                    {discount > 0 && <div className="absolute top-0 right-0 z-10 bg-[#6B4226] text-white px-2 py-1 text-[10px] font-black rounded-bl-lg">{toPersianDigits(discount)}٪ تخفیف</div>}
                    <ProductCard product={p} />
                    <div className="px-3 pb-3 space-y-2">
                      {Array.isArray(p.availableSizes) && p.availableSizes.length > 0 && <p className="text-[10px] text-gray-500 truncate"><b className="text-[#3B3228]">سایز:</b> {p.availableSizes.slice(0, 2).join("، ")}</p>}
                      <div className="flex items-center justify-between text-[10px] text-gray-500"><span>موجودی محدود</span><span className="text-[#6B4226] font-bold">{toPersianDigits(stock || 12)} عدد</span></div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-[#6B4226]" style={{ width: `${stockPercent}%` }} /></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => scroll("right")} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md text-[#3B3228] opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
        </div>
      </div>
    </section>
  );
}
