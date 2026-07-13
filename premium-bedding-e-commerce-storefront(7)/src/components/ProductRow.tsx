"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductRow({ title, products, viewAllLink = "/shop", viewAllLabel = "مشاهده همه", bgColor = "bg-white/60" }: {
  title: string; products: any[]; viewAllLink?: string; viewAllLabel?: string; bgColor?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "l" ? 320 : -320, behavior: "smooth" }); };

  if (products.length === 0) return null;

  return (
    <section className={`${bgColor} py-8`}>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-black text-[#3B3228]">{title}</h2>
          <Link href={viewAllLink} className="text-[#5C6F54] text-xs font-bold flex items-center gap-1 hover:text-[#7A8E72] transition group">
            {viewAllLabel} <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="relative group/row">
          <button onClick={() => scroll("l")} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg text-[#3B3228] opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center hover:bg-[#7A8E72] hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1" style={{ scrollbarWidth: "none" }}>
            {products.map(p => (
              <div key={p.id} className="snap-start shrink-0 w-[65vw] sm:w-[38vw] md:w-[27vw] lg:w-[21vw] xl:w-[18vw]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <button onClick={() => scroll("r")} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg text-[#3B3228] opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center hover:bg-[#7A8E72] hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
