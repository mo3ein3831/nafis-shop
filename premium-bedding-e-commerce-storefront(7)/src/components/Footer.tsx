"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#3B3228] text-[#EBE4D8] pt-12 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-black text-white">نَفیس</span>
          </Link>
          <p className="text-xs text-[#8C8175] leading-relaxed">فروشگاه تخصصی کالای خواب نفیس گلپایگان. باکیفیت‌ترین روتختی، بالش و لحاف.</p>
          <div className="space-y-1.5 text-xs text-[#8C8175]">
            <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-[#7A8E72] shrink-0 mt-0.5" />اصفهان، گلپایگان، خیابان امام خمینی، پاساژ شریفی</p>
            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#7A8E72] shrink-0" /><span className="dir-ltr">031-57454739</span></p>
            <p className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-[#7A8E72] shrink-0" /><span className="dir-ltr">09130965236</span></p>
            <p className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-[#7A8E72] shrink-0" /><span className="dir-ltr">09026982723</span></p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-3">دسته‌بندی‌ها</h3>
          <ul className="space-y-2 text-xs text-[#8C8175]">
            <li><Link href="/shop?category=bedding-sets" className="hover:text-[#9AAF8E] transition">کالای خواب</Link></li>
            <li><Link href="/shop?category=organizers" className="hover:text-[#9AAF8E] transition">نظم‌دهنده</Link></li>
            <li><Link href="/shop?category=kitchen" className="hover:text-[#9AAF8E] transition">آشپزخانه</Link></li>
            <li><Link href="/shop?category=rugs" className="hover:text-[#9AAF8E] transition">روفرشی و فرش</Link></li>
            <li><Link href="/shop?category=towels" className="hover:text-[#9AAF8E] transition">حمام و حوله</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-3">خدمات مشتریان</h3>
          <ul className="space-y-2 text-xs text-[#8C8175]">
            <li><Link href="/lookup" className="hover:text-[#9AAF8E] transition">پیگیری سفارش</Link></li>
            <li><Link href="/wishlist" className="hover:text-[#9AAF8E] transition">علاقه‌مندی‌ها</Link></li>
            <li><Link href="/shop" className="hover:text-[#9AAF8E] transition">شرایط بازگشت کالا</Link></li>
            <li><Link href="/checkout" className="hover:text-[#9AAF8E] transition">راهنمای خرید</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-3">عضویت در خبرنامه</h3>
          <p className="text-xs text-[#8C8175] mb-3">از تخفیف‌ها باخبر شوید:</p>
          <div className="flex gap-2">
            <input type="text" placeholder="شماره موبایل" className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#8C8175] focus:outline-none focus:ring-1 focus:ring-[#7A8E72] dir-ltr text-center" />
            <button className="bg-[#7A8E72] hover:bg-[#5C6F54] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105">ثبت</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#8C8175]">
        <span>© ۱۴۰۴ کالای خواب نفیس گلپایگان</span>
        <Link href="/admin" className="text-[#8C8175]/40 hover:text-[#8C8175] transition">مدیریت</Link>
      </div>
    </footer>
  );
}
