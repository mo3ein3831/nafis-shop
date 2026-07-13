import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "کالای خواب نفیس گلپایگان | روتختی، بالش، لحاف، پتو، حوله، شال مبل",
  description: "فروشگاه آنلاین کالای خواب نفیس گلپایگان. خرید روتختی ابریشمی، بالش طبی مموری فوم، لحاف پر قو، پتو، حوله، شال مبل، پادری، روفرشی و لوازم آشپزخانه با ضمانت اصالت و ارسال رایگان سراسری.",
  keywords: ["کالای خواب","روتختی","بالش طبی","لحاف پر قو","پتو","حوله","شال مبل","پادری","روفرشی","حصیر","محافظ تشک","روبالشی","لوازم آشپزخانه","نفیس","گلپایگان"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#F5F0E8] text-[#3B3228] antialiased selection:bg-[#9AAF8E] selection:text-white">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
