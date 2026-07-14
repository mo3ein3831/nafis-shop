"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { formatPrice, toPersianDigits } from "@/lib/format";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  FileText,
} from "lucide-react";

function LookupContent() {
  const sp = useSearchParams();
  const qParam = sp.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loggedPhone, setLoggedPhone] = useState("");

  // Pre-fill phone if user is logged in
  useEffect(() => {
    try {
      const s = localStorage.getItem("nafis_customer");
      if (s) {
        const c = JSON.parse(s);
        if (c.phone && !qParam) {
          setLoggedPhone(c.phone);
          setSearchTerm(c.phone);
        }
      }
    } catch {}
  }, [qParam]);

  // Auto-search if coming from success page with order number
  useEffect(() => {
    if (qParam) {
      handleSearchWithTerm(qParam);
    }
  }, []); // eslint-disable-line

  const handleSearchWithTerm = async (term: string) => {
    if (!term.trim()) return;
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      if (term.trim().toUpperCase().startsWith("NFS-")) {
        const res = await fetch(`/api/orders/${term.trim().toUpperCase()}`);
        const data = await res.json();
        setOrders(data.order ? [data.order] : []);
      } else {
        const res = await fetch(`/api/orders?phone=${encodeURIComponent(term.trim())}`);
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("لطفاً شماره سفارش (مثال: NFS-84910) یا شماره موبایل خود را وارد کنید.");
      return;
    }
    handleSearchWithTerm(searchTerm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return {
          text: "در انتظار پرداخت",
          bg: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <Clock className="w-4 h-4 text-amber-600" />,
        };
      case "processing":
        return {
          text: "در حال بسته‌بندی و آماده‌سازی",
          bg: "bg-blue-100 text-blue-800 border-blue-300",
          icon: <Package className="w-4 h-4 text-blue-600" />,
        };
      case "shipped":
        return {
          text: "ارسال شده (تحویل به پست/تیپاکس)",
          bg: "bg-purple-100 text-purple-800 border-purple-300",
          icon: <Truck className="w-4 h-4 text-purple-600" />,
        };
      case "delivered":
        return {
          text: "تحویل داده شده به مشتری",
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        };
      default:
        return {
          text: "ثبت شده",
          bg: "bg-stone-100 text-stone-800 border-stone-300",
          icon: <FileText className="w-4 h-4 text-stone-600" />,
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <CartDrawer />
      <Toast />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Breadcrumb items={[{ label: "پیگیری سفارش" }]} />
        <div className="text-center max-w-2xl mx-auto mb-8 mt-6 space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#EFECE6] text-[#7A8E72] flex items-center justify-center mx-auto shadow-2xs">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">پیگیری وضعیت سفارش</h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            برای اطلاع از وضعیت سفارش، شماره سفارش (مانند NFS-84910) یا شماره موبایلی که با آن خرید کرده‌اید را وارد کنید.
            {loggedPhone && <span className="block mt-1 text-[#7A8E72] font-bold">✅ شماره شما از حساب کاربری تشخیص داده شد: {loggedPhone}</span>}
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto bg-white p-3 rounded-2xl border border-[#EBE4D8] shadow-sm flex items-center gap-2"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="شماره سفارش (مثال: NFS-48190) یا شماره موبایل (۰۹۱۲...)"
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-stone-400 font-bold"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3B3228] hover:bg-[#7A8E72] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shrink-0 shadow-2xs"
          >
            <Search className="w-4 h-4 text-[#D6C49E]" />
            <span>{loading ? "درحال جستجو..." : "پیگیری سفارش"}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 max-w-xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Area */}
        <div className="mt-10 space-y-6">
          {loading && (
            <div className="py-16 text-center font-bold text-stone-600">در حال دریافت وضعیت سفارش از سرور...</div>
          )}

          {!loading && searched && orders.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#EBE4D8] shadow-2xs space-y-3 max-w-xl mx-auto">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-extrabold text-base text-stone-800">سفارشی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              لطفاً از صحت شماره سفارش یا موبایل واردشده اطمینان حاصل کنید.
              <br />📱 شماره موبایل رو با ۰۹ شروع کنید (مثل: ۰۹۱۲۳۴۵۶۷۸۹)
              <br />📦 شماره سفارش با NFS- شروع میشه (مثل: NFS-48190)
            </p>
            </div>
          )}

          {!loading &&
            orders.map((order, idx) => {
              const statusInfo = getStatusBadge(order.status);
              const itemsList = Array.isArray(order.items) ? order.items : [];

              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-[#EBE4D8] shadow-sm overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div className="bg-[#2D3728] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#7A8E72] text-[#D6C49E] flex items-center justify-center font-bold">
                        #{toPersianDigits(idx + 1)}
                      </div>
          <div>
            <span className="text-xs text-stone-400 block">شماره سفارش رسمی:</span>
            <span className="text-lg font-black text-[#D6C49E] dir-ltr inline-block">
              {order.orderNumber}
            </span>
          </div>
          <div className="text-xs text-stone-400">
            📅 {new Date(order.createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })}
          </div>
                    </div>

                    <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 font-bold text-xs ${statusInfo.bg}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>

                  {/* Customer & Shipping info */}
                  <div className="p-5 bg-[#F5F0E8] border-b border-[#EBE4D8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#7A8E72] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-500 block">خریدار / شماره تماس:</span>
                        <span className="font-extrabold text-stone-900 mt-0.5 block">
                          {order.customerName} ({toPersianDigits(order.customerPhone)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-[#7A8E72] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-500 block">آدرس ارسال و کد پستی:</span>
                        <span className="font-extrabold text-stone-900 mt-0.5 block">
                          {order.customerCity}، {order.customerAddress} (کد پستی: {toPersianDigits(order.customerPostalCode)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="p-5 space-y-3">
                    <h4 className="font-black text-stone-900 text-xs sm:text-sm border-b border-[#EBE4D8] pb-2">
                      اقلام خریداری شده در این سفارش ({toPersianDigits(itemsList.length)} کالا)
                    </h4>

                    <div className="space-y-2.5">
                      {itemsList.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F5F0E8] border border-[#EBE4D8]/80 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.namePersian}
                                className="w-12 h-12 rounded-lg object-cover border border-[#EBE4D8] bg-white"
                              />
                            )}
                            <div>
                              <span className="font-bold text-xs sm:text-sm text-stone-900 block">
                                {item.namePersian}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-medium">
                                <span>تعداد: {toPersianDigits(item.quantity)} عدد</span>
                                {item.size && <span>| سایز: {item.size}</span>}
                                {item.color && <span>| رنگ: {item.color.name}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="font-black text-xs sm:text-sm text-stone-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Totals Summary */}
                  <div className="p-5 bg-[#F5F0E8] border-t border-[#EBE4D8] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-stone-600 space-y-1">
                      <div>
                        <span>روش ارسال: </span>
                        <b className="text-stone-900">
                          {order.shippingMethod === "express_courier"
                            ? "پیک فوری ویژه"
                            : order.shippingMethod === "tipax"
                            ? "تیپاکس سراسری"
                            : "پست پیشتاز"}
                        </b>
                      </div>
                      <div>
                        <span>روش پرداخت: </span>
                        <b className="text-stone-900">
                          {order.paymentMethod === "online_gateway"
                            ? "پرداخت آنلاین درگاه بانکی"
                            : order.paymentMethod === "card_transfer"
                            ? "کارت به کارت"
                            : "پرداخت در محل"}
                        </b>
                      </div>
                    </div>

                    <div className="bg-[#3B3228] text-white px-5 py-2.5 rounded-xl text-center sm:text-left flex items-center gap-3 shadow-2xs">
                      <div>
                        <span className="text-[11px] text-stone-300 block">مبلغ کل پرداخت شده:</span>
                        <span className="text-base font-black text-[#D6C49E]">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#7A8E72] border-t-transparent rounded-full animate-spin" /></div>}>
      <LookupContent />
    </Suspense>
  );
}
