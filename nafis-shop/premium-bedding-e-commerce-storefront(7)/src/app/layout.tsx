import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { OfflineBanner } from "@/components/OfflineBanner";

export const metadata: Metadata = {
  title: "نفیس | روتختی، بالش و کالای خواب با ضمانت بازگشت ۷ روزه",
  description: "اگه به خواب باکیفیت و عمیق اهمیت میدی، جای درستی اومدی. فروشگاه اینترنتی کالای خواب نفیس گلپایگان — روتختی ابریشمی، بالش طبی مموری فوم، لحاف پر قو و حوله هتلی با ارسال رایگان بالای ۴ میلیون.",
  keywords: ["کالای خواب","روتختی","بالش طبی","لحاف پر قو","پتو","حوله","نفیس","گلپایگان","بالش مموری فوم","ملحفه","کالای خواب گلپایگان"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#F5F0E8] text-[#3B3228] antialiased selection:bg-[#9AAF8E] selection:text-white">
        <CartProvider>
          <OfflineBanner />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
