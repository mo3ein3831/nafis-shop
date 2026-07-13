"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function DualHero() {
  return (
    <section className="max-w-[1400px] mx-auto px-3 sm:px-4 py-3 sm:py-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3 min-h-[430px] lg:h-[500px]">
        {/* Main bedding story */}
        <div className="relative overflow-hidden rounded-2xl group min-h-[280px]">
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90" alt="روتختی و ملحفه هتلی نفیس" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/25 to-transparent" />
          <div className="relative z-10 h-full flex items-center p-7 sm:p-10">
            <div className="max-w-sm text-right">
              <span className="inline-block text-[11px] bg-white/15 text-white backdrop-blur-sm rounded-full px-3 py-1 mb-4">مرکز تخصصی خواب</span>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">شبی آرام،<br /><span className="text-[#7A8E72]">صبحی سبک</span></h1>
              <p className="text-sm text-white/75 leading-7 mt-3">روتختی‌های پنبه‌دوزی، ملحفه‌های هتلی و لحاف‌های چهار فصل برای خانه‌ای که هر شب شبیه هتل باشد.</p>
              <Link href="/shop?category=bedding-sets" className="mt-5 inline-flex items-center gap-2 bg-white text-[#3B3228] rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-[#EBE4D8] transition">خرید کالای خواب <ArrowLeft className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>

        {/* New organization line */}
        <div className="relative overflow-hidden rounded-2xl group min-h-[220px]">
          <img src="https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1200&q=88" alt="باکس و نظم‌دهنده خانه" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B3228]/85 via-[#3B3228]/25 to-transparent" />
          <div className="relative z-10 h-full flex items-end p-6">
            <div>
              <span className="inline-block text-[11px] text-[#7A8E72] mb-2">لاین جدید نفیس</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">خانه خود را<br />نو و منظم کنید</h2>
              <p className="text-xs text-white/70 mt-2">باکس‌های رخت‌خواب، ارگانایزر و روفرشی‌های کش‌دار</p>
              <Link href="/shop?category=organizers" className="mt-4 inline-flex items-center gap-2 text-white text-xs font-bold border-b border-white/50 pb-1 hover:text-[#7A8E72] transition">مشاهده راهکارهای نظم‌دهی <ArrowLeft className="w-3.5 h-3.5" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
