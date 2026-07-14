"use client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ShieldCheck, Award, Truck, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#3B3228]">
      <Header /><CartDrawer /><Toast />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <Breadcrumb items={[{ label: "درباره ما" }]} />
        <h1 className="text-2xl font-black mb-6 mt-4">درباره کالای خواب نفیس</h1>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">

          <p>
            راستش را بخواهید، <b className="text-[#3B3228]">نفیس</b> از یه دغدغه ساده متولد شد: اینکه چرا باید آدم‌ها
            شب‌ها توی تخت خودشون راحت نباشن؟ چرا باید صبح با گردن‌درد و کمرگرفتگی بیدار بشن، در حالی که یه سوم عمرشون
            توی تخت می‌گذره؟
          </p>

          <p>
            ما توی <b>گلپایگان</b> (استان اصفهان) کارمون رو شروع کردیم. اول یه مغازه کوچیک بود توی پاساژ شریفی.
            مشتری‌ها میان، روتختی می‌خریدن، برمی‌گشتن خونه. بعد از چند هفته زنگ می‌زدن می‌گفتن «پارچه‌ش بعد از شستشو
            زبر شده» یا «رنگش رفته». این بازخوردها اذیتمون می‌کرد. گفتیم یا یه کاریش می‌کنیم، یا بی‌خیال این کار می‌شیم.
          </p>

          <p>
            رفتیم سراغ تولیدی‌های درجه یک. پارچه رو مستقیم از ترکیه و بهترین نساجی‌های داخلی گرفتیم. دوخت رو آوردیم
            زیر نظر مستقیم خودمون. نتیجه؟ <b>روتختی‌ای که بعد از ده بار شستشو هم مثل روز اول نرم و لطیف می‌مونه.</b>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, t: "ضمانت بازگشت ۷ روزه", d: "اگه راضی نبودی، بی‌قید و شرط پسش بده" },
              { icon: <Award className="w-6 h-6" />, t: "دوخت و بافت موندگار", d: "بعد از ده‌بار شستشو هم مثل روز اول" },
              { icon: <Truck className="w-6 h-6" />, t: "ارسال به سراسر ایران", d: "پیک فوری گلپایگان + تیپاکس و پست" },
              { icon: <MapPin className="w-6 h-6" />, t: "فروشگاه حضوری", d: "گلپایگان، پاساژ شریفی" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="text-[#7A8E72] shrink-0">{x.icon}</div>
                <div><span className="font-bold text-[#3B3228] text-sm block">{x.t}</span><span className="text-xs text-gray-500">{x.d}</span></div>
              </div>
            ))}
          </div>

          <p>
            امروز افتخارمون اینه که نه فقط توی گلپایگان، بلکه از شهرهای مختلف ایران بهمون اعتماد می‌کنن. راستش رو بخواید،
            این اعتماد از یه چیز ساده میاد: <b>ما چیزی که خودمون می‌پسندیم رو می‌فروشیم.</b> هر روتختی، هر بالش، هر
            لحافی که بسته‌بندی می‌شه، قبلش یه بار از چشم ما رد شده.
          </p>

          <div className="bg-[#F5F0E8] rounded-xl p-5 mt-4 space-y-2">
            <p className="font-bold text-base">📌 آدرس و تماس:</p>
            <p>فروشگاه حضوری: <b>اصفهان، گلپایگان، خیابان امام خمینی، پاساژ شریفی، کالای خواب نفیس</b></p>
            <p>تلفن ثابت: <span className="dir-ltr font-bold">031-57454739</span></p>
            <p>همراه و واتساپ: <span className="dir-ltr font-bold">09130965236</span> | <span className="dir-ltr font-bold">09026982723</span></p>
            <p className="text-xs text-gray-500 mt-2">شنبه تا پنجشنبه، ۹ صبح تا ۹ شب پاسخگوی شما هستیم.</p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
