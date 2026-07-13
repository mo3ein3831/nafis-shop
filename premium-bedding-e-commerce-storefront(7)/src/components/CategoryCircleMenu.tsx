"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MICRO_CATEGORIES } from "@/lib/categories";

export function CategoryCircleMenu() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpenIdx(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-12" ref={containerRef}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold text-[#7A8E72] mb-1">راحت‌تر پیدا کنید</p>
          <h2 className="text-xl font-black text-[#3B3228]">خرید بر اساس دسته‌بندی</h2>
        </div>
        <Link href="/shop" className="hidden sm:flex text-xs font-bold text-[#6B4226] items-center gap-1 hover:underline">همه دسته‌ها ←</Link>
      </div>

      <div className="flex flex-wrap justify-center gap-7 sm:gap-10 lg:gap-14">
        {MICRO_CATEGORIES.map((c, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center gap-2"
            onMouseEnter={() => setOpenIdx(i)}
            onMouseLeave={() => setOpenIdx(null)}
          >
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="relative flex flex-col items-center gap-2 group focus:outline-none">
              <div className="relative w-[82px] h-[82px] sm:w-[100px] sm:h-[100px] rounded-full shadow-sm group-hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1.5 group-hover:scale-105 ring-1 ring-black/5 bg-[#EBE4D8]">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-white/95 shadow-md flex items-center justify-center border border-gray-100">
                  <ChevronDown className={`w-3 h-3 text-[#6B4226] transition-transform duration-300 ${openIdx === i ? "rotate-180" : ""}`} />
                </span>
              </div>
              <span className="text-xs font-bold text-[#3B3228] group-hover:text-[#6B4226] transition text-center leading-tight max-w-[105px]">{c.name}</span>
            </button>

            {openIdx === i && (
              <div className="absolute top-[94px] sm:top-[112px] z-30 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 w-48 animate-[fadeInUp_0.15s_ease-out]">
                <Link href={`/shop?category=${c.slug}`} onClick={() => setOpenIdx(null)} className="block px-3 py-2 rounded-lg text-xs font-black text-[#6B4226] hover:bg-[#EBE4D8] transition mb-1">مشاهده همه {c.name}</Link>
                <div className="border-t border-gray-100 my-1" />
                <Link href={`/shop?category=${c.slug}&search=${encodeURIComponent(c.search)}`} onClick={() => setOpenIdx(null)} className="block px-3 py-1.5 rounded-lg text-[11px] text-gray-600 hover:text-[#6B4226] hover:bg-gray-50 transition">{c.search}</Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
