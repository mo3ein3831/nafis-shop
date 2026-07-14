"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useCart } from "@/context/CartContext";
import { formatPrice, toPersianDigits } from "@/lib/format";
import confetti from "canvas-confetti";
import {
  ShieldCheck, Truck, CreditCard, MapPin, Phone, User,
  CheckCircle2, Lock, Gift, ShoppingBag, Copy,
} from "lucide-react";

const CARD_NUMBER = "5894-6311-3609-1972";
const CARD_OWNER = "محمدحسین اله‌بخشی";
const CARD_BANK = "سپه";
const SUPPORT_PHONE = "09130965236";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("اصفهان - گلپایگان");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState("express_courier");
  const [paymentMethod, setPaymentMethod] = useState("online_gateway");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ code: string; percent: number } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [copied, setCopied] = useState(false);

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
    if (code === "NAFIS20") setDiscountApplied({ code: "NAFIS20", percent: 20 });
    else if (code === "SLEEP10") setDiscountApplied({ code: "SLEEP10", percent: 10 });
    else setDiscountError("کد تخفیف نامعتبر است (NAFIS20 یا SLEEP10)");
  };

  const getDeliveryEstimate = () => {
    if (shippingMethod === "express_courier" && customerCity.includes("گلپایگان")) return "امروز (۲ تا ۴ ساعت)";
    if (shippingMethod === "express_courier") return "فردا";
    if (shippingMethod === "tipax") return "۲ تا ۳ روز کاری";
    return "۳ تا ۵ روز کاری";
  };
  const deliveryEstimate = getDeliveryEstimate();

  const handleCopyCard = () => {
    navigator.clipboard?.writeText("5894631136091972");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          customerName, customerPhone, customerCity, customerAddress, customerPostalCode,
          shippingMethod, paymentMethod, items,
          discountCode: discountApplied ? discountApplied.code : "",
          note: orderNote, isGift, giftRecipient: isGift ? giftRecipient : "",
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
        clearCart();
        router.push(`/checkout/success?orderNumber=${data.order.orderNumber}`);
      } else {
        alert(data.error || "خطا در ثبت سفارش.");
      }
    } catch (err) {
      console.error(err);
      alert("خطا در ارتباط با سرور");
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
          <Link href="/shop" className="bg-[#3B3228] hover:bg-[#7A8E72] text-white font-extrabold px-8 py-4 rounded-2xl text-sm transition shadow-md">
            بازگشت به فروشگاه
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Breadcrumb items={[{ label: "تکمیل سفارش" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-5 mb-8">
          <div>
            <span className="text-xs font-bold text-[#7A8E72] uppercase tracking-wider block mb-1">مرحله پایانی خرید</span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">تکمیل و ثبت نهایی سفارش</h1>
          </div>
          <div className="flex items-center gap-2 bg-[#EFECE6] text-[#3B3228] px-4 py-2 rounded-xl text-xs font-bold w-fit border border-[#EBE4D8]">
            <Lock className="w-4 h-4 text-[#7A8E72]" />
            <span>تسویه حساب امن و رمزنگاری‌شده</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">

              {/* Step 1: Customer Details */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">۱</div>
                  <h2 className="font-black text-stone-900 text-base">اطلاعات تحویل‌گیرنده</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5 text-stone-500" />نام و نام خانوادگی *</label>
                    <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="مثال: علی رضایی" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-500" />شماره موبایل *</label>
                    <input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="۰۹۱۳۰۰۰۰۰۰۰" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition dir-ltr text-right" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-stone-500" />استان و شهر *</label>
                    <select value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition cursor-pointer">
                      <option value="اصفهان - گلپایگان">اصفهان - گلپایگان</option>
                      <option value="تهران">تهران</option><option value="اصفهان">اصفهان</option><option value="شیراز">شیراز</option><option value="مشهد">مشهد</option><option value="تبریز">تبریز</option><option value="کرج">کرج</option><option value="رشت">رشت</option><option value="اهواز">اهواز</option><option value="سایر شهرها">سایر شهرها</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">کد پستی (اختیاری)</label>
                    <input type="text" value={customerPostalCode} onChange={(e) => setCustomerPostalCode(e.target.value)} placeholder="۱۲۳۴۵۶۷۸۹۰" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition dir-ltr text-right" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-stone-500" />آدرس دقیق پستی *</label>
                    <textarea required rows={2} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="مثال: گلپایگان، خیابان امام خمینی، پلاک ۱۲" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition" />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">۲</div>
                  <h2 className="font-black text-stone-900 text-base">انتخاب روش ارسال</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "express_courier", name: "پیک فوری ویژه (گلپایگان)", desc: "تحویل ۲ تا ۴ ساعته", cost: 180000 },
                    { id: "tipax", name: "ارسال با تیپاکس (سراسر ایران)", desc: "تحویل ۲۴ تا ۴۸ ساعته", cost: 160000 },
                    { id: "post", name: "پست پیشتاز (سراسری)", desc: "تحویل ۲ تا ۴ روز کاری", cost: 120000 },
                  ].map((method) => (
                    <label key={method.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${shippingMethod === method.id ? "border-[#7A8E72] bg-[#F5F0E8] shadow-2xs" : "border-[#EBE4D8] hover:border-[#A6B09B] bg-white"}`}>
                      <div className="flex items-center gap-3.5">
                        <input type="radio" name="ship" value={method.id} checked={shippingMethod === method.id} onChange={(e) => setShippingMethod(e.target.value)} className="w-5 h-5 accent-[#7A8E72]" />
                        <div><span className="font-extrabold text-xs sm:text-sm text-stone-900 block">{method.name}</span><span className="text-xs text-stone-500 block mt-0.5">{method.desc}</span></div>
                      </div>
                      <span className="font-black text-xs sm:text-sm text-stone-900 shrink-0">{isFreeShipping ? "رایگان 🎁" : formatPrice(method.cost)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">۳</div>
                  <h2 className="font-black text-stone-900 text-base">انتخاب روش پرداخت</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "online_gateway", name: "پرداخت آنلاین (درگاه بانکی)", desc: "پرداخت با کلیه کارت‌های شتاب", icon: <CreditCard className="w-5 h-5 text-[#7A8E72]" /> },
                    { id: "card_transfer", name: "کارت به کارت", desc: "واریز به شماره کارت فروشگاه", icon: <Lock className="w-5 h-5 text-[#836E49]" /> },
                    { id: "cash_on_delivery", name: "پرداخت در محل (ویژه گلپایگان)", desc: "تسویه با کارتخوان هنگام تحویل", icon: <Truck className="w-5 h-5 text-blue-700" /> },
                  ].map((pay) => (
                    <label key={pay.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === pay.id ? "border-[#7A8E72] bg-[#F5F0E8] shadow-2xs" : "border-[#EBE4D8] hover:border-[#A6B09B] bg-white"}`}>
                      <div className="flex items-center gap-3.5">
                        <input type="radio" name="pay" value={pay.id} checked={paymentMethod === pay.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#7A8E72]" />
                        <div className="flex items-center gap-2">{pay.icon}<div><span className="font-extrabold text-xs sm:text-sm text-stone-900 block">{pay.name}</span><span className="text-xs text-stone-500 block mt-0.5">{pay.desc}</span></div></div>
                      </div>
                    </label>
                  ))}

                  {/* 💳 Card Info — visible when card_transfer selected */}
                  {paymentMethod === "card_transfer" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 mt-3">
                      <p className="text-xs font-bold text-amber-800">💳 شماره کارت جهت واریز:</p>
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-100">
                        <span className="text-sm font-black text-[#3B3228] dir-ltr tracking-widest">{CARD_NUMBER}</span>
                        <button type="button" onClick={handleCopyCard} className="bg-[#7A8E72] hover:bg-[#5C6F54] text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition shrink-0 flex items-center gap-1">
                          <Copy className="w-3 h-3" /> {copied ? "کپی شد" : "کپی"}
                        </button>
                      </div>
                      <div className="text-[11px] text-amber-700 space-y-1">
                        <p>👤 به نام: <b>{CARD_OWNER}</b> | 🏦 بانک: <b>{CARD_BANK}</b></p>
                        <p className="text-amber-600">📸 رسید واریز را به واتساپ <span className="dir-ltr font-black">{SUPPORT_PHONE}</span> ارسال کنید.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Gift & Notes */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-4">
                <div className="flex items-center gap-3 border-b border-[#EBE4D8] pb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B3228] text-white flex items-center justify-center font-black text-xs">۴</div>
                  <h2 className="font-black text-stone-900 text-base">توضیحات و هدیه</h2>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">یادداشت سفارش (اختیاری)</label>
                  <textarea rows={2} value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="مثلاً: زنگ بزنید قبل از تحویل..." className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition" />
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="w-4 h-4 accent-[#7A8E72] rounded" />
                  🎁 این سفارش یه هدیست!
                </label>
                {isGift && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">نام گیرنده هدیه</label>
                    <input type="text" value={giftRecipient} onChange={(e) => setGiftRecipient(e.target.value)} placeholder="مثلاً: مامان عزیزم" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#7A8E72] focus:outline-none transition" />
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-sm sticky top-24 space-y-5">
              <h3 className="font-black text-stone-900 text-base border-b border-[#EBE4D8] pb-3.5">فاکتور سفارش</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F5F0E8] border border-[#EBE4D8]">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.namePersian} className="w-11 h-11 rounded-lg object-cover border border-[#EBE4D8] shrink-0 bg-white" />
                      <div>
                        <span className="font-bold text-xs text-stone-900 line-clamp-1 block">{item.namePersian}</span>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                          <span>تعداد: {toPersianDigits(item.quantity)}</span>
                          {item.size && <span>| {item.size}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#EBE4D8]">
                <label className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5"><Gift className="w-4 h-4 text-[#836E49]" />کد تخفیف:</label>
                <div className="flex gap-2">
                  <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="NAFIS20" className="flex-1 bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs font-bold uppercase placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7A8E72] dir-ltr text-center" />
                  <button onClick={handleApplyDiscount} type="button" className="bg-[#3B3228] hover:bg-[#7A8E72] text-white font-bold px-4 py-2 rounded-xl text-xs transition">اعمال</button>
                </div>
                {discountApplied && <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />تخفیف {toPersianDigits(discountApplied.percent)}٪</p>}
                {discountError && <p className="text-xs font-bold text-red-600 mt-2">{discountError}</p>}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#EBE4D8] text-xs sm:text-sm font-semibold text-stone-600">
                <div className="flex justify-between"><span>مجموع کالاها:</span><span className="font-bold text-stone-900">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>هزینه ارسال:</span><span className={isFreeShipping ? "text-[#7A8E72] font-bold" : "text-stone-900 font-bold"}>{isFreeShipping ? "رایگان 🎁" : formatPrice(actualShippingCost)}</span></div>
                <div className="flex justify-between text-[#7A8E72]"><span>⏱ زمان تحویل:</span><span className="font-black">{deliveryEstimate}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-red-600 font-bold"><span>تخفیف:</span><span>- {formatPrice(discountAmount)}</span></div>}
                <div className="flex justify-between pt-3 border-t border-[#EBE4D8] text-base sm:text-lg font-black text-stone-900"><span>مبلغ نهایی:</span><span className="text-[#3B3228]">{formatPrice(totalPayable)}</span></div>
              </div>

              <button type="submit" form="checkout-form" disabled={isSubmitting} className="w-full bg-[#3B3228] hover:bg-[#7A8E72] text-[#EBE4D8] font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 transition shadow-lg hover:shadow-xl text-sm disabled:opacity-60">
                <ShieldCheck className="w-5 h-5 text-[#D6C49E]" />
                <span>{isSubmitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش و پرداخت"}</span>
              </button>
              <p className="text-[11px] text-center text-stone-500 font-medium">با ثبت سفارش، قوانین ۷ روز ضمانت بازگشت را می‌پذیرید.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
