"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice, toPersianDigits } from "@/lib/format";
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  PhoneCall,
  Crown,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Error fetching success order:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {loading ? (
          <div className="py-20 text-center font-bold text-stone-600">در حال تولید رسید رسمی و فاکتور کالا...</div>
        ) : !order ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EBE4D8] shadow-sm space-y-4">
            <h2 className="text-2xl font-black text-stone-900">سفارش یافت نشد!</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              ممکن است شماره سفارش نادرست باشد یا هنوز در سیستم ثبت نشده باشد. برای پیگیری به صفحه پیگیری سفارش مراجعه کنید.
            </p>
            <Link
                    href={`/lookup?q=${order.orderNumber}`}
              className="inline-block bg-[#3B3228] text-white font-bold px-6 py-3 rounded-xl text-xs"
            >
              رفتن به پیگیری سفارشات
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#EBE4D8] shadow-md overflow-hidden print:shadow-none print:border-none">
            {/* Top Celebration Header */}
            <div className="bg-[#3B3228] text-white p-8 sm:p-10 text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-full bg-[#7A8E72] border-2 border-[#D6C49E] text-[#D6C49E] flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {order.paymentMethod === "card_transfer"
                  ? "سفارش شما ثبت شد! لطفاً مبلغ را واریز کنید."
                  : order.paymentMethod === "cash_on_delivery"
                  ? "سفارش شما با موفقیت ثبت شد!"
                  : "سفارش شما با موفقیت در سیستم ثبت شد!"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-200 max-w-xl mx-auto leading-relaxed">
                {order.paymentMethod === "card_transfer"
                  ? <>لطفاً مبلغ <b className="text-[#D6C49E]">{formatPrice(order.totalAmount)}</b> را به شماره کارت فروشگاه واریز کنید.</>
                  : <>از اعتماد شما به <b className="text-[#D6C49E]">کالای خواب نفیس گلپایگان</b> سپاسگزاریم.</>
                }
              </p>

              <div className="inline-flex items-center gap-2 bg-stone-950/40 border border-[#D6C49E]/40 px-6 py-2.5 rounded-2xl text-[#D6C49E] font-extrabold text-base sm:text-lg mt-2">
                <span>کد رهگیری سفارش نفیس:</span>
                <span className="dir-ltr inline-block tracking-wider">{order.orderNumber}</span>
              </div>
            </div>

            {/* Invoice Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-[#7A8E72]" />
                  <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                    فاکتور رسمی فروشگاه کالای خواب نفیس (شعبه گلپایگان)
                  </span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-[#F5F0E8] hover:bg-[#EFECE6] text-stone-800 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border border-[#EBE4D8] transition print:hidden"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ یا دانلود فاکتور (PDF)</span>
                </button>
              </div>

              {/* Buyer Information Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 bg-[#F5F0E8] p-5 rounded-2xl border border-[#EBE4D8] text-xs sm:text-sm">
                <div>
                  <span className="text-stone-500 block font-semibold mb-1">تحویل‌گیرنده:</span>
                  <span className="font-black text-stone-900">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block font-semibold mb-1">شماره تماس:</span>
                  <span className="font-black text-stone-900 dir-ltr inline-block">
                    {toPersianDigits(order.customerPhone)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block font-semibold mb-1">شهر و کد پستی:</span>
                  <span className="font-black text-stone-900">
                    {order.customerCity} (کد پستی: {toPersianDigits(order.customerPostalCode)})
                  </span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-stone-500 block font-semibold mb-1">آدرس دقیق تحویل:</span>
                  <span className="font-black text-stone-900 leading-relaxed">
                    {order.customerAddress}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-black text-stone-900 text-sm sm:text-base mb-3">
                  اقلام خریداری‌شده در این سفارش:
                </h3>
                <div className="border border-[#EBE4D8] rounded-2xl overflow-hidden divide-y divide-[#EBE4D8]">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F5F0E8]"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.namePersian}
                              className="w-12 h-12 rounded-xl object-cover border border-[#EBE4D8] bg-white"
                            />
                          )}
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-stone-900 block">
                              {item.namePersian}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mt-1">
                              <span>تعداد: {toPersianDigits(item.quantity)} عدد</span>
                              {item.size && <span>| سایز: {item.size}</span>}
                              {item.color && <span>| رنگ: {item.color.name}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:text-left font-black text-xs sm:text-sm text-stone-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-[#F5F0E8] p-5 rounded-2xl border border-[#EBE4D8] space-y-2.5 text-xs sm:text-sm font-semibold text-stone-700">
                <div className="flex justify-between">
                  <span>مجموع مبلغ کالاها:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>هزینه ارسال کالا ({order.shippingMethod === "express_courier" ? "پیک فوری گلپایگان" : order.shippingMethod === "tipax" ? "تیپاکس" : "پست"}):</span>
                  <span>{order.shippingCost === 0 ? "رایگان 🎁" : formatPrice(order.shippingCost)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>مبلغ تخفیف کالا:</span>
                    <span>- {formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-[#EBE4D8] text-base sm:text-lg font-black text-stone-900">
                  <span>مبلغ کل پرداخت‌شده:</span>
                  <span className="text-[#3B3228]">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Card transfer payment info */}
              {order.paymentMethod === "card_transfer" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3 print:hidden">
                  <p className="text-sm font-black text-amber-800">💳 اطلاعات پرداخت کارت به کارت</p>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-100">
                    <span className="text-base font-black text-[#3B3228] dir-ltr tracking-widest">5894-6311-3609-1972</span>
                    <button type="button" onClick={() => { navigator.clipboard?.writeText("5894631136091972"); alert("کپی شد!"); }} className="bg-[#7A8E72] hover:bg-[#5C6F54] text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition">📋 کپی</button>
                  </div>
                  <div className="text-[11px] text-amber-700 space-y-1">
                    <p>👤 <b>به نام: محمدحسین اله‌بخشی</b> | 🏦 <b>بانک سپه</b></p>
                    <p className="text-amber-600">📸 لطفاً رسید واریز را به واتساپ <span className="dir-ltr font-black">09130965236</span> ارسال کنید.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto bg-[#3B3228] hover:bg-[#7A8E72] text-white font-black px-8 py-3.5 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <span>بازگشت به فروشگاه و ادامه خرید</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </Link>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-600 dir-ltr">
                  <span>031-57454739 | 09130965236</span>
                  <PhoneCall className="w-4 h-4 text-[#7A8E72]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-12 text-center font-bold">در حال بارگذاری فاکتور...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
