"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, RefreshCw, HeartHandshake, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { ProductRow } from "@/components/ProductRow";
import { AmazingStrip } from "@/components/AmazingStrip";
import { GroupBox } from "@/components/GroupBox";
import { MEGA_GROUPS } from "@/lib/categories";

const CAT_CIRCLES = [
  { name: "کالای خواب", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80", search: "روتختی" },
  { name: "نظم‌دهنده", img: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=400&q=80", search: "باکس" },
  { name: "آشپزخانه", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80", search: "سفره" },
  { name: "روفرشی و فرش", img: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=400&q=80", search: "روفرشی" },
  { name: "حمام و حوله", img: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=400&q=80", search: "حوله" },
  { name: "کودک و سفر", img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80", search: "کودک" },
];

const HERO_SLIDES = [
  { img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90", title: "شبی آرام، صبحی سبک", sub: "روتختی‌های پنبه‌دوزی و ملحفه‌های هتلی" },
  { img: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1800&q=88", title: "خانه خود را منظم کنید", sub: "باکس‌های رخت‌خواب و ارگانایزر شاسی‌دار" },
  { img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1800&q=85", title: "بالش‌های طبی ارگونومیک", sub: "خداحافظی با درد گردن و بی‌خوابی" },
  { img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1800&q=85", title: "لحاف‌های چهار فصل پر قو", sub: "گرما در زمستان، خنکی در تابستان" },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>{children}</div>;
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => undefined);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const amazing = products.filter(p => p.isAmazingOffer).slice(0, 12);
  const newest = products.filter(p => p.isNewArrival).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#3B3228]">
      <Header /><CartDrawer /><Toast />

      <main>
        {/* HERO SLIDER */}
        <section className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[65vh] overflow-hidden">
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === heroIdx ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
              <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#3B3228]/70 via-[#3B3228]/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-[1400px] mx-auto px-6 w-full">
                  <div className="max-w-lg mr-auto text-left space-y-3 animate-[fadeInUp_0.6s_ease-out]">
                    <span className="inline-block bg-[#7A8E72]/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">فروشگاه تخصصی نفیس</span>
                    <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">{slide.title}</h1>
                    <p className="text-sm text-white/80">{slide.sub}</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-[#7A8E72] hover:bg-[#5C6F54] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      مشاهده همه محصولات <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === heroIdx ? "bg-white w-8" : "bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
          <button onClick={() => setHeroIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition"><ChevronRight className="w-5 h-5" /></button>
        </section>

        {/* TRUST */}
        <section className="bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Truck className="w-5 h-5" />, t: "ارسال سریع", d: "تیپاکس و پست پیشتاز" },
              { icon: <ShieldCheck className="w-5 h-5" />, t: "ضمانت اصالت", d: "۱۰۰٪ الیاف طبیعی" },
              { icon: <RefreshCw className="w-5 h-5" />, t: "۷ روز بازگشت", d: "بدون قید و شرط" },
              { icon: <HeartHandshake className="w-5 h-5" />, t: "مشاوره رایگان", d: "031-57454739" },
            ].map(x => (
              <div key={x.t} className="flex items-center gap-2.5 group hover:bg-[#F5F0E8] p-2 rounded-xl transition-colors">
                <div className="text-[#7A8E72] group-hover:scale-110 transition-transform">{x.icon}</div>
                <div><b className="block text-xs">{x.t}</b><span className="text-[10px] text-[#8C8175]">{x.d}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* ── AMAZING STRIP (Digikala style, right ABOVE categories) ── */}
        <FadeIn>
          <AmazingStrip products={amazing} />
        </FadeIn>

        {/* ── CATEGORY CIRCLES ── */}
        <FadeIn>
          <section className="max-w-[1400px] mx-auto px-4 py-8">
            <h2 className="text-xl font-black text-center mb-8">خرید بر اساس دسته‌بندی</h2>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-14">
              {CAT_CIRCLES.map((c, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <Link href={`/shop?search=${encodeURIComponent(c.search)}`} className="flex flex-col items-center gap-2.5 group">
                    <div className="w-[88px] h-[88px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105 ring-2 ring-[#E2DACC] group-hover:ring-[#7A8E72]">
                      <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <span className="text-xs font-bold text-[#3B3228] group-hover:text-[#5C6F54] transition">{c.name}</span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ── 6 GROUP BOXES (stacked, one per pillar) ── */}
        <section className="max-w-[1400px] mx-auto px-4 py-6 space-y-5">
          {MEGA_GROUPS.map((group, idx) => (
            <FadeIn key={group.name} delay={idx * 60}>
              <GroupBox
                title={group.name}
                products={products.filter(p => group.sections.some(s => p.categorySlug === s.slug)).slice(0, 10)}
                viewAllLink={`/shop?category=${group.sections[0]?.slug}`}
              />
            </FadeIn>
          ))}
        </section>

        {/* ── NEWEST ── */}
        <ProductRow title="جدیدترین محصولات" products={newest} viewAllLink="/shop?sort=newest" viewAllLabel="مشاهده همه" bgColor="bg-[#EBE4D8]" />

        {/* ── WHY NAFIS ── */}
        <FadeIn>
          <section className="bg-[#3B3228] text-white py-12 mt-4">
            <div className="max-w-[1400px] mx-auto px-4">
              <h2 className="text-xl font-black text-center mb-8 text-[#9AAF8E]">چرا کالای خواب نفیس؟</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                {[
                  { n: "۱", t: "تنفس‌پذیری فوق‌العاده", d: "پنبه ارگانیک رطوبت را سریع‌تر جذب می‌کند" },
                  { n: "۲", t: "محافظت ستون فقرات", d: "بالش‌های مموری فوم انحنای گردن را حفظ می‌کنند" },
                  { n: "۳", t: "لطافت ابریشمی", d: "برای پوست و مو تجربه‌ای نرم‌تر می‌سازد" },
                ].map(x => (
                  <div key={x.n} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                    <span className="text-3xl font-black text-[#7A8E72] block mb-2">{x.n}</span>
                    <h3 className="font-bold text-sm mb-1.5">{x.t}</h3>
                    <p className="text-xs text-white/60">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
