"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { Phone, User, Lock, ArrowLeft, CheckCircle2, LogOut, ArrowRight } from "lucide-react";

type Step = "phone" | "login" | "register" | "loggedin";

export default function AuthPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nafis_customer");
      if (saved) {
        setCustomer(JSON.parse(saved));
        setStep("loggedin");
      }
    } catch {}
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) { setError("شماره موبایل معتبر وارد کنید."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth?phone=${encodeURIComponent(cleanPhone)}`);
      const data = await res.json();
      setStep(data.exists ? "login" : "register");
    } catch { setError("خطا در ارتباط با سرور"); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password.trim()) { setError("رمز عبور را وارد کنید."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim(), mode: "login" }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("nafis_customer", JSON.stringify(data.customer));
        setCustomer(data.customer);
        setStep("loggedin");
      } else { setError(data.error || "خطا در ورود"); }
    } catch { setError("خطا در ارتباط با سرور"); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("نام و نام خانوادگی را وارد کنید."); return; }
    if (!password.trim() || password.trim().length < 4) { setError("رمز عبور باید حداقل ۴ کاراکتر باشد."); return; }
    if (password.trim() !== password2.trim()) { setError("رمز عبور و تکرار آن یکسان نیستند."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim(), name: name.trim(), mode: "register" }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("nafis_customer", JSON.stringify(data.customer));
        setCustomer(data.customer);
        setStep("loggedin");
      } else { setError(data.error || "خطا در ثبت‌نام"); }
    } catch { setError("خطا در ارتباط با سرور"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("nafis_customer");
    setCustomer(null);
    setStep("phone");
    setPhone(""); setName(""); setPassword(""); setPassword2("");
  };

  const goBackToPhone = () => { setStep("phone"); setPassword(""); setPassword2(""); setError(""); };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#3B3228]">
      <Header />
      <CartDrawer />
      <Toast />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-sm">
          {step === "loggedin" && customer ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h1 className="text-lg font-black">خوش آمدید{customer.name ? `، ${customer.name}` : ""}</h1>
              <p className="text-xs text-gray-500">شماره موبایل: <span className="dir-ltr inline-block font-bold">{customer.phone}</span></p>

              <div className="space-y-2 pt-4">
                <Link href="/shop" className="block w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold py-3 rounded-xl text-sm transition text-center">
                  مشاهده فروشگاه
                </Link>
                <Link href="/lookup" className="block w-full bg-gray-50 hover:bg-gray-100 text-[#3B3228] font-bold py-3 rounded-xl text-sm transition text-center">
                  پیگیری سفارشات من
                </Link>
                <Link href="/wishlist" className="block w-full bg-gray-50 hover:bg-gray-100 text-[#3B3228] font-bold py-3 rounded-xl text-sm transition text-center">
                  لیست علاقه‌مندی‌ها
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#6B4226] font-bold py-2 text-xs transition mt-2">
                  <LogOut className="w-3.5 h-3.5" /> خروج از حساب
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 space-y-5">
              <div className="text-center space-y-2">
                <img src="/images/logo.png" alt="" className="w-10 h-10 mx-auto rounded-lg" />
                <h1 className="text-lg font-black">ورود | ثبت‌نام</h1>
                <p className="text-xs text-gray-400">کالای خواب نفیس گلپایگان</p>
              </div>

              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">شماره موبایل</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="09130000000" dir="ltr"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-[#3B3228] text-center focus:outline-none focus:ring-2 focus:ring-[#7A8E72] focus:bg-white" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? "بررسی..." : "ادامه"} <ArrowLeft className="w-4 h-4" />
                  </button>
                </form>
              )}

              {step === "login" && (
                <form onSubmit={handleLogin} className="space-y-3">
                  <button type="button" onClick={goBackToPhone} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#6B4226] mb-1">
                    <ArrowRight className="w-3.5 h-3.5" /> تغییر شماره موبایل
                  </button>
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg text-center">
                    شماره <b className="dir-ltr inline-block">{phone}</b> قبلاً ثبت‌نام شده. رمز عبور خود را وارد کنید.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">رمز عبور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="رمز عبور خود را وارد کنید"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-[#3B3228] focus:outline-none focus:ring-2 focus:ring-[#7A8E72] focus:bg-white" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-50">
                    {loading ? "درحال ورود..." : "ورود به حساب کاربری"}
                  </button>
                </form>
              )}

              {step === "register" && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <button type="button" onClick={goBackToPhone} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#6B4226] mb-1">
                    <ArrowRight className="w-3.5 h-3.5" /> تغییر شماره موبایل
                  </button>
                  <p className="text-xs text-gray-500 bg-green-50 p-2 rounded-lg text-center">
                    🎉 خوش آمدید! برای شماره <b className="dir-ltr inline-block">{phone}</b> حساب جدید بسازید.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">نام و نام خانوادگی</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="مثال: علی رضایی"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-[#3B3228] focus:outline-none focus:ring-2 focus:ring-[#7A8E72] focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">رمز عبور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="حداقل ۴ کاراکتر"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-[#3B3228] focus:outline-none focus:ring-2 focus:ring-[#7A8E72] focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">تکرار رمز عبور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      <input type="password" required value={password2} onChange={e => setPassword2(e.target.value)}
                        placeholder="رمز عبور را دوباره وارد کنید"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-[#3B3228] focus:outline-none focus:ring-2 focus:ring-[#7A8E72] focus:bg-white" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-50">
                    {loading ? "درحال ثبت‌نام..." : "ثبت‌نام و ورود"}
                  </button>
                </form>
              )}

              <p className="text-[10px] text-gray-400 text-center">
                با ورود، <Link href="/shop" className="text-[#6B4226] underline">شرایط و قوانین</Link> فروشگاه نفیس را می‌پذیرید.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
