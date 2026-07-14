"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#F5F0E8] text-[#3B3228]">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-xl font-black mb-2">خطای سیستمی</h1>
          <p className="text-sm text-stone-500 mb-6">مشکلی پیش آمده. لطفاً صفحه را refresh کنید.</p>
          <button
            onClick={reset}
            className="bg-[#3B3228] text-white font-bold px-6 py-3 rounded-xl text-sm"
          >
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}
