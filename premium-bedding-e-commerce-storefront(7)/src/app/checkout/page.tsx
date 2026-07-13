"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { formatPrice, toPersianDigits } from "@/lib/format";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Lock,
  Gift,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("اصفهان - گلپایگان");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");

  const [shippingMethod, setShippingMethod] = useState("express_courier"); // express_courier, tipax, post
  const [paymentMethod, setPaymentMethod] = useState("online_gateway"); // online_gateway, card_transfer, cash_on_delivery
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ code: string; percent: number } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Free shipping check
  const FREE_SHIPPING_THRESHOLD = 4000000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  let baseShippingCost = 150000;
  if (shippingMethod === "express_courier") baseShippingCost = 180000;
  else if (shippingMethod === "tipax") baseShippingCost = 160000;
  else if (shippingMethod === "post") baseShippingCost = 120000;

  const actualShippingCost = isFreeShipping ? 0 : baseShippingCost;

  const discountAmount = discountApplied ? Math.round(subtotal * (discountApplied.percent / 100)) : 0;
  const totalPayable = subtotal + actualShippingCost - discountAmount;

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError("");
    const code = discountCode.trim().toUpperCase();
    if (code === "NAFIS20") {
      setDiscountApplied({ code: "NAFIS20", percent: 20 });
      alert("کد تخفیف ۲۰ درصدی با موفقیت اعمال شد!");
    } else if (code === "SLEEP10") {
      setDiscountApplied({ code: "SLEEP10", percent: 10 });
      alert("کد تخفیف ۱۰ درصدی با موفقیت اعمال شد!");
    } else {
      setDiscountError("کد تخفیف وارد شده نامعتبر است (کدهای نمونه: NAFIS20 یا SLEEP10)");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("لطفاً نام، شماره موبایل و آدرس دقیق ارسال را تکمیل کنید.");
      return;
    }
    if (items.length === 0) {
      alert("سبد خرید شما خالی است.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerCity,
          customerAddress,
          customerPostalCode,
          shippingMethod,
          paymentMethod,
          items,
          discountCode: discountApplied ? discountApplied.code : "",
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        clearCart();
        router.push(`/checkout/success?orderNumber=${data.order.orderNumber}`);
      } else {
        alert(data.error || "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.");
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("خطا در برقراری ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center w-full flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center text-stone-400 mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2">سبد خرید شما خالی است!</h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-8">
            برای ثبت سفارش ابتدا محصولات مورد نظر خود را از فروشگاه انتخاب کرده و به سبد خرید اضافه کنید.
          </p>
          <Link
            href="/shop"
            className="bg-[#3B3228] hover:bg-[#7A8E72] text-white font-extrabold px-8 py-4 rounded-2xl text-sm transition shadow-md"
          >
            بازگشت به فروشگاه کالای خواب نفیس
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title / Secure Checkout Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-5 mb-8">
          <div>
            <span className="text-xs font-bold text-[#7A8E72] uppercase tracking-wider block mb-1">
              مرحله پایانی خرید
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">تکمیل و ثبت نهایی سفارش</h1>
          </div>

          <div className="flex items-center gap-2 bg-[#EFECE6] text-[#3B3228] px-4 py-2 rounded-xl text-xs font-bold w-fit border border-[#EBE4D8]">
            <Lock className="w-4 h-4 text-[#7A8E72]" />
            <span>تسویه حساب امن و رمزنگاری‌شده ۲۵۶ بیتی بانکی</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - SHIPPING & PAYMENT FORM (Col 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Step 1: Customer Details */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">
                    ۱
                  </div>
                  <h2 className="font-black text-stone-900 text-base">اطلاعات تحویل‌گیرنده سفارش</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      نام و نام خانوادگی تحویل‌گیرنده *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: علی رضایی"
                      className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      شماره موبایل فعال (جهت هماهنگی پیک و پیامک) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="۰۹۱۳۰۰۰۰۰۰۰"
                      className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition dir-ltr text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      استان و شهر سکونت *
                    </label>
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition cursor-pointer"
                    >
                      <option value="اصفهان - گلپایگان">اصفهان - گلپایگان (ارسال فوری ۲ ساعته)</option>
                      <option value="تهران">تهران (ارسال فوری یا تیپاکس)</option>
                      <option value="اصفهان">اصفهان</option>
                      <option value="شیراز">شیراز</option>
                      <option value="مشهد">مشهد</option>
                      <option value="تبریز">تبریز</option>
                      <option value="کرج">کرج</option>
                      <option value="رشت">رشت</option>
                      <option value="اهواز">اهواز</option>
                      <option value="سایر شهرها">سایر شهرهای ایران</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      کد پستی ۱۰ رقمی (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={customerPostalCode}
                      onChange={(e) => setCustomerPostalCode(e.target.value)}
                      placeholder="۱۲۳۴۵۶۷۸۹۰"
                      className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition dir-ltr text-right"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      آدرس دقیق پستی (خیابان اصلی، کوچه، پلاک، واحد) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="مثال: گلپایگان، خیابان امام خمینی، روبروی بانک، کوچه چهاردهم، پلاک ۱۲"
                      className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Method */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">
                    ۲
                  </div>
                  <h2 className="font-black text-stone-900 text-base">انتخاب روش ارسال کالا</h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "express_courier",
                      name: "پیک فوری ویژه (گلپایگان و حومه)",
                      desc: "تحویل سریع ۲ تا ۴ ساعته همراه با بسته‌بندی جعبه‌ای لوکس",
                      cost: 180000,
                    },
                    {
                      id: "tipax",
                      name: "ارسال با تیپاکس (سراسری به تمام استان‌ها و شهرها)",
                      desc: "تحویل ۲۴ تا ۴۸ ساعته با بیمه‌نامه کامل سلامت کالا",
                      cost: 160000,
                    },
                    {
                      id: "post",
                      name: "پست پیشتاز سفارشی (سراسری)",
                      desc: "تحویل ۲ تا ۴ روز کاری، ارزان‌ترین روش برای کلیه نقاط",
                      cost: 120000,
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                        shippingMethod === method.id
                          ? "border-[#7A8E72] bg-[#F5F0E8] shadow-2xs"
                          : "border-[#EBE4D8] hover:border-[#A6B09B] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="shipping_method"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="w-5 h-5 accent-[#7A8E72]"
                        />
                        <div>
                          <span className="font-extrabold text-xs sm:text-sm text-stone-900 block">
                            {method.name}
                          </span>
                          <span className="text-xs text-stone-500 block mt-0.5 font-normal">
                            {method.desc}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-xs sm:text-sm text-stone-900 shrink-0">
                        {isFreeShipping ? "رایگان 🎁" : formatPrice(method.cost)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">
                    ۳
                  </div>
                  <h2 className="font-black text-stone-900 text-base">انتخاب روش پرداخت</h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "online_gateway",
                      name: "پرداخت آنلاین اینترنتی (درگاه رسمی زرین‌پال / بانک ملت)",
                      desc: "قابلیت پرداخت با کلیه کارت‌های بانکی عضو شتاب همراه با تایید آنی",
                      icon: <CreditCard className="w-5 h-5 text-[#7A8E72]" />,
                    },
                    {
                      id: "card_transfer",
                      name: "کارت به کارت یا انتقال بانکی (شماره کارت / شبا فروشگاه)",
                      desc: "دریافت شماره کارت پس از ثبت سفارش و ارسال رسید پرداخت",
                      icon: <Lock className="w-5 h-5 text-[#836E49]" />,
                    },
                    {
                      id: "cash_on_delivery",
                      name: "پرداخت در محل هنگام تحویل کالا (ویژه گلپایگان)",
                      desc: "تسویه با دستگاه کارتخوان سیار (POS) در هنگام تحویل سفارش توسط پیک نفیس",
                      icon: <Truck className="w-5 h-5 text-blue-700" />,
                    },
                  ].map((pay) => (
                    <label
                      key={pay.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                        paymentMethod === pay.id
                          ? "border-[#7A8E72] bg-[#F5F0E8] shadow-2xs"
                          : "border-[#EBE4D8] hover:border-[#A6B09B] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="payment_method"
                          value={pay.id}
                          checked={paymentMethod === pay.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 accent-[#7A8E72]"
                        />
                        <div className="flex items-center gap-2">
                          {pay.icon}
                          <div>
                            <span className="font-extrabold text-xs sm:text-sm text-stone-900 block">
                              {pay.name}
                            </span>
                            <span className="text-xs text-stone-500 block mt-0.5 font-normal">
                              {pay.desc}
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY & DISCOUNT (Col 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-sm sticky top-24 space-y-5">
              <h3 className="font-black text-stone-900 text-base border-b border-[#EBE4D8] pb-3.5">
                خلاصه اقلام سفارش و فاکتور نهایی
              </h3>

              {/* Items Summary list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F5F0E8] border border-[#EBE4D8]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.namePersian}
                        className="w-11 h-11 rounded-lg object-cover border border-[#EBE4D8] shrink-0 bg-white"
                      />
                      <div>
                        <span className="font-bold text-xs text-stone-900 line-clamp-1 block">
                          {item.namePersian}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                          <span>تعداد: {toPersianDigits(item.quantity)}</span>
                          {item.size && <span>| {item.size}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Code Input Box */}
              <div className="pt-4 border-t border-[#EBE4D8]">
                <label className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#836E49]" />
                  کد تخفیف یا هدیه خود را وارد کنید:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="مثال: NAFIS20 یا SLEEP10"
                    className="flex-1 bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs font-bold uppercase placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7A8E72] dir-ltr text-center"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    type="button"
                    className="bg-[#3B3228] hover:bg-[#7A8E72] text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    اعمال
                  </button>
                </div>
                {discountApplied && (
                  <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تخفیف {toPersianDigits(discountApplied.percent)} درصدی ({discountApplied.code}) اعمال شد.
                  </p>
                )}
                {discountError && (
                  <p className="text-xs font-bold text-red-600 mt-2">{discountError}</p>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-[#EBE4D8] text-xs sm:text-sm font-semibold text-stone-600">
                <div className="flex justify-between">
                  <span>مجموع مبلغ کالاها:</span>
                  <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>هزینه ارسال کالا:</span>
                  <span className={isFreeShipping ? "text-[#7A8E72] font-bold" : "text-stone-900 font-bold"}>
                    {isFreeShipping ? "رایگان 🎁" : formatPrice(actualShippingCost)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>مبلغ تخفیف اعمال شده:</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-[#EBE4D8] text-base sm:text-lg font-black text-stone-900">
                  <span>مبلغ نهایی قابل پرداخت:</span>
                  <span className="text-[#3B3228]">{formatPrice(totalPayable)}</span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-[#3B3228] hover:bg-[#7A8E72] text-[#EBE4D8] font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 transition shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-60"
              >
                <ShieldCheck className="w-5 h-5 text-[#D6C49E]" />
                <span>
                  {isSubmitting
                    ? "در حال ثبت سفارش در سیستم..."
                    : "ثبت نهایی سفارش و پرداخت"}
                </span>
              </button>

              <p className="text-[11px] text-center text-stone-500 font-medium">
                با کلیک بر روی دکمه ثبت سفارش، قوانین و شرایط ۷ روز ضمانت بازگشت فروشگاه نفیس گلپایگان را می‌پذیرید.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
