import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#F5F0E8] text-[#3B3228] antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="text-8xl font-black text-[#7A8E72]/30 mb-4">۴۰۴</div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3B3228] mb-2">
            صفحه مورد نظر یافت نشد!
          </h1>
          <p className="text-sm text-[#8C8175] max-w-md mb-8 leading-relaxed">
            متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است. 
            می‌توانید از طریق لینک زیر به فروشگاه بازگردید.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              بازگشت به صفحه اصلی
            </Link>
            <Link
              href="/shop"
              className="bg-white border border-[#EBE4D8] hover:bg-[#F5F0E8] text-[#3B3228] font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              فروشگاه
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
