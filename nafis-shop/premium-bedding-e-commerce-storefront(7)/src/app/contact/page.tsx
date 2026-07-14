"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MapPin, Phone, Smartphone, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) {
      setError("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, phone: formPhone, message: formMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setFormName(""); setFormPhone(""); setFormMessage("");
      } else {
        setError(data.error || "خطا در ارسال");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#3B3228]">
      <Header /><CartDrawer /><Toast />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <Breadcrumb items={[{ label: "تماس با ما" }]} />
        <h1 className="text-2xl font-black mb-6 mt-4">تماس با ما</h1>
        {/* Google Maps */}
        <div className="mb-8 rounded-xl overflow-hidden border border-[#EBE4D8] shadow-sm">
          <iframe
            src="https://www.google.com/maps?q=%DA%AF%D9%84%D9%BE%D8%A7%DB%8C%DA%AF%D8%A7%D9%86+%D9%BE%D8%A7%D8%B3%D8%A7%DA%98+%D8%B4%D8%B1%DB%8C%D9%81%DB%8C&output=embed"
            width="100%"
            height="280"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="موقعیت فروشگاه نفیس روی نقشه"
          />
          <div className="bg-[#F5F0E8] p-2 text-center text-xs text-[#8C8175]">
            📍 اصفهان، گلپایگان، خیابان امام خمینی، پاساژ شریفی — 
            <a href="https://maps.google.com/?q=گلپایگان+پاساژ+شریفی" target="_blank" rel="noopener" className="text-[#6B4226] font-bold underline">مشاهده در Google Maps</a>
          </div>
        </div>
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
          {sent ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#7A8E72] mx-auto" />
              <p className="font-bold text-lg">پیام شما با موفقیت ارسال شد!</p>
              <p className="text-sm text-gray-500">در اسرع وقت با شما تماس خواهیم گرفت.</p>
              <button onClick={() => setSent(false)} className="text-[#6B4226] font-bold text-sm underline">ارسال پیام جدید</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="نام شما" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
              <input type="tel" required value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="شماره تماس" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
              <textarea required rows={4} value={formMessage} onChange={e => setFormMessage(e.target.value)} placeholder="متن پیام شما..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
              {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
              <button type="submit" disabled={sending} className="bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" /> {sending ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
