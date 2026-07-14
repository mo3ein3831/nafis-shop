"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F5F0E8]">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-[#3B3228] mb-2">
        خطایی رخ داد!
      </h1>
      <p className="text-sm text-[#8C8175] max-w-md mb-8 leading-relaxed">
        متأسفانه مشکلی در بارگذاری صفحه پیش آمده. لطفاً دوباره تلاش کنید.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold px-6 py-3 rounded-xl text-sm transition"
        >
          تلاش دوباره
        </button>
        <Link
          href="/"
          className="bg-white border border-[#EBE4D8] hover:bg-[#F5F0E8] text-[#3B3228] font-bold px-6 py-3 rounded-xl text-sm transition"
        >
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
