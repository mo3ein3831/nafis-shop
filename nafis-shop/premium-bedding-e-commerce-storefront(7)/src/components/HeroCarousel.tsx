"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, toPersianDigits } from "@/lib/format";

export type Slide = {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  gradient?: string;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    title: "خوابی به نرمی پر قو",
    subtitle: "روتختی ابریشمی، بالش طبی و لحاف پر قو از ۱۰۰٪ پنبه مصری ارگانیک",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=90",
    ctaText: "مشاهده فروشگاه",
    ctaLink: "/shop",
  },
  {
    title: "جشنواره فروش ویژه تابستانه",
    subtitle: "تا ۴۰٪ تخفیف روی سرویس‌های روتختی عروس",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=2000&q=90",
    ctaText: "خرید با تخفیف",
    ctaLink: "/shop?sort=price_asc",
    badge: "٪۴۰ تخفیف",
  },
  {
    title: "بالش‌های طبی مموری فوم",
    subtitle: "خداحافظی با درد گردن و بی‌خوابی",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=2000&q=85",
    ctaText: "خرید بالش طبی",
    ctaLink: "/shop?category=pillows",
  },
  {
    title: "ارسال رایگان سراسری",
    subtitle: "سفارشات بالای ۴ میلیون تومان با تیپاکس بیمه‌شده ارسال رایگان",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=2000&q=80",
    ctaText: "مشاهده محصولات",
    ctaLink: "/shop",
    badge: "ارسال رایگان",
  },
];

export function HeroCarousel({ slides: overrideSlides, targetDate }: { slides?: Slide[]; targetDate?: string }) {
  const slides = overrideSlides || DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const goTo = (i: number) => { setCurrent(i); setPaused(true); setTimeout(() => setPaused(false), 8000); };

  const now = new Date().getTime();
  const target = targetDate ? new Date(targetDate).getTime() : now + 24 * 60 * 60 * 1000;
  const diff = Math.max(0, target - now);
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <section className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[65vh] overflow-hidden bg-[#EBE4D8]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${s.gradient || "bg-gradient-to-l from-black/65 via-black/35 to-transparent"}`} />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 w-full">
              <div className="max-w-lg mr-auto text-left">
                {s.badge && (
                  <span className="inline-block bg-[#6B4226] text-white text-xs font-bold px-3 py-1 rounded-full mb-4 animate-pulse">
                    {s.badge}
                  </span>
                )}
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">{s.title}</h1>
                <p className="text-sm text-white/80 mb-5 max-w-sm">{s.subtitle}</p>
                <Link href={s.ctaLink}
                  className="inline-flex items-center gap-2 bg-white text-[#3B3228] font-bold px-6 py-3 rounded-lg text-sm hover:bg-[#EBE4D8] transition-all duration-300 shadow-lg hover:shadow-xl">
                  {s.ctaText} <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-8" : "bg-white/40 hover:bg-white/70"}`} />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white flex items-center justify-center transition">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white flex items-center justify-center transition">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Countdown timer (optional) */}
      {targetDate && (
        <div className="absolute top-4 right-4 z-20 bg-[#6B4226]/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold">
          <Clock className="w-4 h-4" />
          <span>پایان تخفیف:</span>
          <span className="dir-ltr tabular">{toPersianDigits(String(hrs).padStart(2, "0"))}:{toPersianDigits(String(mins).padStart(2, "0"))}:{toPersianDigits(String(secs).padStart(2, "0"))}</span>
        </div>
      )}
    </section>
  );
}
