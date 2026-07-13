"use client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { ShieldCheck, Award, Truck, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#3B3228]">
      <Header /><CartDrawer /><Toast />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-black mb-6">درباره کالای خواب نفیس</h1>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>فروشگاه <b className="text-[#3B3228]">کالای خواب نفیس</b> با هدف ارائه باکیفیت‌ترین محصولات خواب شامل روتختی، بالش طبی، لحاف پر قو، ملحفه ابریشمی و انواع پتو و شال مبل در شهر <b>گلپایگان</b> (استان اصفهان) تأسیس شده است.</p>
          <p>ما معتقدیم یک سوم عمر انسان در خواب سپری می‌شود و کیفیت خواب مستقیماً بر سلامت جسم و روان تأثیر دارد. به همین دلیل تمامی محصولات نفیس از <b>الیاف طبیعی ۱۰۰٪ ارگانیک</b> و با استانداردهای هتل‌های ۵ ستاره تولید می‌شوند.</p>
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, t: "ضمانت اصالت", d: "۱۰۰٪ الیاف طبیعی" },
              { icon: <Award className="w-6 h-6" />, t: "گارانتی ۲۴ ماهه", d: "ثبات رنگ و بافت" },
              { icon: <Truck className="w-6 h-6" />, t: "ارسال سراسری", d: "تیپاکس بیمه‌شده" },
              { icon: <MapPin className="w-6 h-6" />, t: "فروشگاه حضوری", d: "گلپایگان، پاساژ شریفی" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="text-[#7A8E72] shrink-0">{x.icon}</div>
                <div><span className="font-bold text-[#3B3228] text-sm block">{x.t}</span><span className="text-xs text-gray-500">{x.d}</span></div>
              </div>
            ))}
          </div>
          <p>آدرس فروشگاه حضوری: <b>اصفهان، گلپایگان، خیابان امام خمینی، پاساژ شریفی، کالای خواب نفیس</b></p>
          <p>تلفن ثابت: <span className="dir-ltr font-bold">031-57454739</span> &nbsp;|&nbsp; همراه: <span className="dir-ltr font-bold">09130965236</span></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
