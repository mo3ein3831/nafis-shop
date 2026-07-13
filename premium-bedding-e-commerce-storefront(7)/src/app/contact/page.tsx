"use client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { MapPin, Phone, Smartphone, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#3B3228]">
      <Header /><CartDrawer /><Toast />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-black mb-6">تماس با ما</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: <MapPin className="w-5 h-5" />, t: "آدرس فروشگاه", d: "اصفهان، گلپایگان، خیابان امام خمینی، پاساژ شریفی" },
            { icon: <Phone className="w-5 h-5" />, t: "تلفن ثابت", d: "031-57454739" },
            { icon: <Smartphone className="w-5 h-5" />, t: "موبایل و واتساپ", d: "09130965236" },
            { icon: <Clock className="w-5 h-5" />, t: "ساعت کاری", d: "شنبه تا پنجشنبه ۹ صبح تا ۹ شب" },
          ].map((x, i) => (
            <div key={i} className="flex items-start gap-3 p-5 bg-gray-50 rounded-xl">
              <div className="text-[#7A8E72] shrink-0 mt-0.5">{x.icon}</div>
              <div><span className="font-bold text-sm block">{x.t}</span><span className="text-xs text-gray-500">{x.d}</span></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="font-bold text-base mb-4">ارسال پیام</h2>
          <form className="space-y-3" onSubmit={e => { e.preventDefault(); alert("پیام شما ارسال شد. با تشکر از شما."); }}>
            <input type="text" required placeholder="نام شما" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
            <input type="tel" required placeholder="شماره تماس" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
            <textarea required rows={4} placeholder="متن پیام شما..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
            <button type="submit" className="bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition">ارسال پیام</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
