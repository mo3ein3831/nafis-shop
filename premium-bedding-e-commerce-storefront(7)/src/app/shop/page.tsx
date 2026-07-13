"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { MEGA_GROUPS } from "@/lib/categories";
import { X, SlidersHorizontal } from "lucide-react";

const CATS = [
  { id: "all", name: "همه" },
  ...MEGA_GROUPS.flatMap(g => g.sections.map(s => ({ id: s.slug, name: s.name }))),
];

function ShopContent() {
  const sp = useSearchParams();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(sp.get("category") || "all");
  const [search, setSearch] = useState(sp.get("search") || "");
  const [sort, setSort] = useState(sp.get("sort") || "featured");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products on category / search / sort change. Price is filtered client-side.
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (cat !== "all") q.set("category", cat);
        if (search.trim()) q.set("search", search.trim());
        if (sort) q.set("sort", sort);
        const res = await fetch(`/api/products?${q}`);
        const data = await res.json();
        setAllProducts(data.products || []);
        if (priceBounds.max === 0 && data.priceRange?.max > 0) {
          setPriceBounds(data.priceRange);
          setMaxPrice(data.priceRange.max);
        }
      } catch {}
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, search, sort]);

  const products = useMemo(() => {
    if (maxPrice === null || priceBounds.max === 0) return allProducts;
    return allProducts.filter(p => p.price <= maxPrice);
  }, [allProducts, maxPrice, priceBounds.max]);

  const hasFilters = cat !== "all" || !!search || (maxPrice !== null && priceBounds.max > 0 && maxPrice < priceBounds.max);

  const clearAll = () => {
    setCat("all");
    setSearch("");
    if (priceBounds.max > 0) setMaxPrice(priceBounds.max);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header /><CartDrawer /><Toast />

      <main className="flex-1">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-gray-400 mb-0.5">
                <a href="/" className="hover:text-[#6B4226]">صفحه اصلی</a> / <span className="text-[#3B3228] font-bold">فروشگاه</span>
              </div>
              <h1 className="text-base sm:text-lg font-black">{CATS.find(c => c.id === cat)?.name || "فروشگاه نفیس"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">
                <SlidersHorizontal className="w-3.5 h-3.5" /> فیلتر
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[#3B3228] focus:outline-none appearance-none">
                <option value="featured">پیشنهاد نفیس</option>
                <option value="rating">بیشترین امتیاز</option>
                <option value="price_asc">ارزان‌ترین</option>
                <option value="price_desc">گران‌ترین</option>
                <option value="newest">جدیدترین</option>
              </select>
              <span className="text-xs text-gray-400 font-bold">{toPersianDigits(products.length)} کالا</span>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 pb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  cat === c.id ? "bg-[#3B3228] text-white" : "bg-gray-50 text-[#3B3228] hover:bg-gray-100 border border-gray-100"
                }`}>{c.name}</button>
            ))}
            {hasFilters && (
              <button onClick={clearAll}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-[#6B4226] bg-red-50 hover:bg-red-100 transition flex items-center gap-1">
                <X className="w-3 h-3" /> حذف فیلتر
              </button>
            )}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-5">
          <div className="flex gap-5">
            <aside className={`${showFilters ? "block" : "hidden"} lg:block w-56 shrink-0`}>
              <div className="sticky top-28 space-y-4">
                {priceBounds.max > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-sm mb-3">محدوده قیمت</h3>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={Math.max(10000, Math.round((priceBounds.max - priceBounds.min) / 50 / 10000) * 10000)}
                      value={maxPrice ?? priceBounds.max}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#6B4226] h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                      <span>{formatPrice(priceBounds.min)}</span>
                      <span className="font-bold text-[#3B3228]">{formatPrice(maxPrice ?? priceBounds.max)}</span>
                    </div>
                  </div>
                )}
                {search && (
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-sm mb-1">جستجو:</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">«{search}»</span>
                      <button onClick={() => setSearch("")} className="text-gray-400 hover:text-[#6B4226]"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-[#7A8E72] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">بارگذاری...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-base font-black mb-2">محصولی یافت نشد</p>
                  <button onClick={clearAll}
                    className="bg-[#3B3228] text-white font-bold px-5 py-2 rounded-lg text-xs hover:bg-[#6B4226] transition">نمایش همه</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#7A8E72] border-t-transparent rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
