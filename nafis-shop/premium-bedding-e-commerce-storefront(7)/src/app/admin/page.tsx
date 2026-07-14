"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { MEGA_GROUPS } from "@/lib/categories";
import {
  Package, Plus, Trash2, Edit, TrendingUp, ShoppingBag, Clock, Download,
  CheckCircle2, AlertCircle, Settings, HelpCircle, X, Phone,
  Globe, CreditCard, Layers, Lock, LogOut, UserCheck, Key, Image as ImageIcon, Palette,
} from "lucide-react";

// Build category list from mega group sections (each section has its own slug)
const UNIQUE_CATS = [...new Map(
  MEGA_GROUPS.flatMap((g) => g.sections.map((s) => ({ slug: s.slug, name: s.name })))
  .map(c => [c.slug, c])
).values()];

const DEFAULT_SIZES: Record<string, string> = {
  "bedding-sets": "کویین (۱۶۰×۲۰۰)\nکینگ (۱۸۰×۲۰۰)",
  pillowcases: "استاندارد (۵۰×۷۰)",
  pillows: "استاندارد طبی (۶۰×۴۰)",
  "organizers-bedding": "بزرگ\nمتوسط",
  "organizers-special": "استاندارد",
  "kitchen-table": "استاندارد",
  "kitchen-textiles": "استاندارد",
  "kitchen-tools": "استاندارد",
  rugs: "۱۵۰×۲۰۰\n۲۰۰×۳۰۰",
  blankets: "۱۵۰×۲۰۰",
  duvets: "تک‌نفره (۱۶۰×۲۲۰)\nدونفره (۲۲۰×۲۴۰)",
  "towels-main": "ست کامل",
  "towels-bathroom": "ست کامل",
  "kids-travel": "کودک",
  travel: "مسافرتی",
  health: "استاندارد طبی",
  "mattress-protectors": "تک‌نفره (۹۰×۲۰۰)\nکویین (۱۶۰×۲۰۰)\nکینگ (۱۸۰×۲۰۰)",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalOrders: 0, totalRevenue: 0, pendingCount: 0, shippedCount: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  const [tab, setTab] = useState<"dash" | "prods" | "ords" | "guide">("dash");
  const [orderFilter, setOrderFilter] = useState("all");
  const [prodSearch, setProdSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [newOrderNotif, setNewOrderNotif] = useState(false);
  const [prevOrderCount, setPrevOrderCount] = useState(0);

  // Form fields
  const [fId, setFId] = useState<number | null>(null);
  const [fName, setFName] = useState("");
  const [fNameEn, setFNameEn] = useState("");
  const [fCat, setFCat] = useState("bedding-sets");
  const [fPrice, setFPrice] = useState("4800000");
  const [fOrigPrice, setFOrigPrice] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fLongDesc, setFLongDesc] = useState("");
  const [fSpecs, setFSpecs] = useState("");
  const [fFeatures, setFFeatures] = useState("");
  const [fSizes, setFSizes] = useState("");
  const [fImages, setFImages] = useState(""); // Multi-image: one URL per line
  const [fColors, setFColors] = useState<Array<{name: string; hex: string}>>([]);
  const [fNewColorName, setFNewColorName] = useState("");
  const [fNewColorHex, setFNewColorHex] = useState("#B08768");
  const [fStock, setFStock] = useState(true);
  const [fFeatured, setFFeatured] = useState(false);
  const [fBest, setFBest] = useState(true);
  const [fAmazing, setFAmazing] = useState(false);
  const [fAmazingEnd, setFAmazingEnd] = useState("");

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/admin/products?limit=200"),
        fetch("/api/admin/orders?limit=100"),
      ]);
      const pData = await pRes.json(); const oData = await oRes.json();
      if (pData.products) setProducts(pData.products);
      if (oData.orders) setOrders(oData.orders);
      if (oData.metrics) setMetrics(oData.metrics);
    } catch (e) { console.error(e); }
    finally { setDataLoading(false); }
  }, []);

  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check session via secure API call instead of localStorage
    (async () => {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) setAuthed(true);
          else setSessionExpired(true);
        } else {
          setSessionExpired(true);
        }
      } catch {}
      setCheckingAuth(false);
    })();
  }, []);
  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/orders?limit=5&page=1");
        const data = await res.json();
        if (data.metrics?.totalOrders > prevOrderCount && prevOrderCount > 0) {
          setNewOrderNotif(true);
          setTimeout(() => setNewOrderNotif(false), 5000);
        }
        if (data.metrics) {
          setMetrics(data.metrics);
          setPrevOrderCount(data.metrics.totalOrders);
        }
        if (data.orders) setOrders(data.orders);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [authed, prevOrderCount]);

  // Simple Jalali date formatter
  const toJalali = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginErr("");
    if (!loginUser.trim() || !loginPass.trim()) { setLoginErr("الزامی"); return; }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: loginUser.trim(), password: loginPass.trim() }) });
      const data = await res.json();
      if (data.success) setAuthed(true);
      else setLoginErr(data.error || "خطا");
    } catch { setLoginErr("خطا در ارتباط"); } finally { setLoginLoading(false); }
  };

  const doLogout = async () => {
    try { await fetch("/api/admin/auth", { method: "DELETE" }); } catch {}
    setAuthed(false);
    setOrders([]); setProducts([]);
  };

  const openAdd = () => {
    setEditing(false); setFId(null); setFName(""); setFNameEn(""); setFCat("bedding-sets");
    setFPrice("4800000"); setFOrigPrice(""); setFDesc(""); setFLongDesc(""); setFSpecs("");
    setFFeatures(""); setFSizes(DEFAULT_SIZES["bedding-sets"] || ""); setFImages(""); setFColors([]);
    setFStock(true); setFFeatured(false); setFBest(true);
    setFAmazing(false); setFAmazingEnd(""); setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(true); setFId(p.id); setFName(p.namePersian || "");
    setFNameEn(p.nameEnglish || ""); setFCat(p.categorySlug || "bedding-sets"); setFPrice(String(p.price || ""));
    setFOrigPrice(p.originalPrice ? String(p.originalPrice) : "");
    setFDesc(p.shortDescription || "");
    setFLongDesc(p.description || p.shortDescription || "");
    setFSpecs(p.specifications ? Object.entries(p.specifications).map(([k,v]) => `${k}: ${v}`).join("\n") : "");
    setFFeatures(Array.isArray(p.features) ? p.features.join("\n") : "");
    setFSizes(Array.isArray(p.availableSizes) ? p.availableSizes.join("\n") : (DEFAULT_SIZES[p.categorySlug] || ""));
    setFImages(Array.isArray(p.images) ? p.images.join("\n") : "");
    setFColors(Array.isArray(p.availableColors) ? p.availableColors : []);
    setFStock(p.inStock !== false); setFFeatured(!!p.isFeatured); setFBest(!!p.isBestSeller);
    setFAmazing(!!p.isAmazingOffer); setFAmazingEnd(p.amazingOfferEnd || "");
    setShowModal(true);
  };

  const addColor = () => {
    if (!fNewColorName.trim()) return;
    setFColors([...fColors, { name: fNewColorName.trim(), hex: fNewColorHex }]);
    setFNewColorName(""); setFNewColorHex("#B08768");
  };
  const removeColor = (idx: number) => setFColors(fColors.filter((_, i) => i !== idx));

  const saveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim() || !fPrice.trim() || !fDesc.trim()) { alert("فیلدهای ستاره‌دار الزامی"); return; }
    setSaving(true);
    try {
      const cat = UNIQUE_CATS.find(c => c.slug === fCat);
      const imagesList = fImages.split("\n").map(s => s.trim()).filter(Boolean);
      const sizesList = fSizes.split("\n").map(s => s.trim()).filter(Boolean);
      const specsObj: Record<string, string> = {};
      if (fSpecs.trim()) {
        fSpecs.split("\n").forEach(line => {
          const idx = line.indexOf(":");
          if (idx > 0) specsObj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        });
      }

      const body = {
        id: fId, namePersian: fName.trim(), nameEnglish: fNameEn.trim() || "",
        category: cat?.name || "کالای خواب", categorySlug: fCat,
        price: Number(fPrice), originalPrice: fOrigPrice ? Number(fOrigPrice) : null,
        shortDescription: fDesc.trim(), description: fLongDesc.trim() || fDesc.trim(),
        specifications: specsObj,
        features: fFeatures.split("\n").map(f => f.trim()).filter(Boolean),
        availableSizes: sizesList.length ? sizesList : ["استاندارد"],
        availableColors: fColors,
        images: imagesList.length ? imagesList : [],
        inStock: fStock, isFeatured: fFeatured, isBestSeller: fBest,
        isAmazingOffer: fAmazing, amazingOfferEnd: fAmazingEnd || null,
      };
      const res = await fetch("/api/admin/products", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchData(); } else alert(data.error || "خطا");
    } catch { alert("خطای سرور"); } finally { setSaving(false); }
  };

  const exportCSV = () => {
    const rows = filteredOrds.map(o => {
      const itemsList = (Array.isArray(o.items) ? o.items : []).map((it: any) => `${it.namePersian} x${it.quantity}`).join(" | ");
      return [
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        o.customerCity,
        STATUS_LABELS[o.status]?.l || o.status,
        formatPrice(o.totalAmount),
        o.createdAt ? toJalali(String(o.createdAt)) : "",
        itemsList,
      ];
    });
    const header = ["شماره سفارش", "مشتری", "موبایل", "شهر", "وضعیت", "مبلغ", "تاریخ", "اقلام"];
    const csvContent = [header, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nafis-orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setFImages(prev => (prev ? prev + "\n" + data.url : data.url));
      } else {
        alert(data.error || "خطا در آپلود");
      }
    } catch {
      alert("خطا در آپلود فایل");
    }
  };

  const deleteProd = async (id: number, name: string) => {
    if (!confirm(`حذف «${name}»؟`)) return;
    try { const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" }); const data = await res.json(); if (data.success) setProducts(prev => prev.filter(p => p.id !== id)); } catch {}
  };

  const changeStatus = async (id: number, status: string) => {
    try { const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); const data = await res.json(); if (data.success) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)); } catch {}
  };

  if (checkingAuth) return <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#7A8E72] border-t-transparent rounded-full animate-spin" /></div>;

  if (!authed) return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-5">
        <div className="text-center space-y-2"><div className="w-12 h-12 rounded-xl bg-[#3B3228] text-white flex items-center justify-center mx-auto"><Lock className="w-6 h-6" /></div><h1 className="text-lg font-black">ورود به پنل مدیریت</h1>{sessionExpired && <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">نشست قبلی منقضی شده. لطفاً دوباره وارد شوید.</p>}</div>
        <form onSubmit={doLogin} className="space-y-3">
          <input type="text" required value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="نام کاربری" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
          <input type="password" required value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="رمز عبور" className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7A8E72]" />
          {loginErr && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{loginErr}</div>}
          <button type="submit" disabled={loginLoading} className="w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-60"><UserCheck className="w-4 h-4 inline ml-1" />{loginLoading ? "بررسی..." : "ورود"}</button>
        </form>
      </div>
    </div>
  );

  const filteredProds = products.filter(p => !prodSearch.trim() || p.namePersian?.toLowerCase().includes(prodSearch.toLowerCase()));
  const filteredOrds = orders.filter(o => {
    const statusMatch = orderFilter === "all" || o.status === orderFilter;
    if (!orderSearch.trim()) return statusMatch;
    const s = orderSearch.trim().toLowerCase();
    return statusMatch && (
      o.orderNumber?.toLowerCase().includes(s) ||
      o.customerName?.toLowerCase().includes(s) ||
      o.customerPhone?.includes(s)
    );
  });
  const PAY_LABELS: Record<string, string> = { online_gateway: "آنلاین", card_transfer: "کارت به کارت", cash_on_delivery: "در محل" };
  const SHIP_LABELS: Record<string, string> = { express_courier: "پیک ویژه", tipax: "تیپاکس", post: "پست پیشتاز" };
  const STATUS_LABELS: Record<string, { l: string; c: string }> = {
    pending_payment: { l: "انتظار پرداخت", c: "bg-amber-100 text-amber-800" },
    processing: { l: "آماده‌سازی", c: "bg-blue-100 text-blue-800" },
    shipped: { l: "ارسال شده", c: "bg-purple-100 text-purple-800" },
    delivered: { l: "تحویل شده", c: "bg-green-100 text-green-800" },
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#3B3228]">
      <div className="bg-[#3B3228] text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Settings className="w-5 h-5" /></div><div><h1 className="text-sm sm:text-base font-black">پنل مدیریت نفیس</h1><span className="text-[10px] text-[#9AAF8E]">گلپایگان، پاساژ شریفی</span></div></div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[#9AAF8E] hover:text-white transition">مشاهده سایت</Link>
            <button onClick={doLogout} className="bg-[#A0522D] hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />خروج</button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#EBE4D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none">
          {([
            { id: "dash" as const, icon: <TrendingUp className="w-4 h-4" />, label: "داشبورد" },
            { id: "prods" as const, icon: <Package className="w-4 h-4" />, label: `محصولات (${toPersianDigits(products.length)})` },
            { id: "ords" as const, icon: <ShoppingBag className="w-4 h-4" />, label: `سفارشات (${toPersianDigits(orders.length)})${newOrderNotif ? " 🔴" : ""}` },
            { id: "guide" as const, icon: <HelpCircle className="w-4 h-4" />, label: "راهنما" },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${tab === t.id ? "border-[#6B4226] text-[#6B4226]" : "border-transparent text-[#8C8175] hover:text-[#3B3228]"}`}>{t.icon}{t.label}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {newOrderNotif && (
          <div className="bg-[#7A8E72] text-white p-3 rounded-xl mb-4 flex items-center justify-between text-sm font-bold animate-pulse">
            <span>🔔 سفارش جدید ثبت شد! برای مشاهده به تب «سفارشات» بروید.</span>
            <button onClick={() => { setNewOrderNotif(false); setTab("ords"); }} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs transition">مشاهده</button>
          </div>
        )}
        {dataLoading ? <div className="py-20 text-center"><div className="w-8 h-8 border-3 border-[#7A8E72] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-[#8C8175]">بارگذاری...</p></div> : <>

          {/* DASHBOARD */}
          {tab === "dash" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "درآمد", value: formatPrice(metrics.totalRevenue), icon: <TrendingUp className="w-5 h-5" /> },
                  { label: "سفارشات", value: `${toPersianDigits(metrics.totalOrders)} عدد`, icon: <ShoppingBag className="w-5 h-5" /> },
                  { label: "در انتظار", value: `${toPersianDigits(metrics.pendingCount)} عدد`, icon: <Clock className="w-5 h-5" /> },
                  { label: "محصولات", value: `${toPersianDigits(products.length)} کالا`, icon: <Package className="w-5 h-5" /> },
                ].map((m, i) => <div key={i} className="bg-white p-5 rounded-xl shadow-sm"><div className="flex items-center justify-between mb-2"><span className="text-[11px] text-[#8C8175] font-bold">{m.label}</span><div className="text-[#9AAF8E]">{m.icon}</div></div><span className="text-lg font-black">{m.value}</span></div>)}
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === "prods" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <input type="text" value={prodSearch} onChange={e => setProdSearch(e.target.value)} placeholder="جستجو..." className="bg-white border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs w-full sm:max-w-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" />
                <button onClick={openAdd} className="bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shrink-0"><Plus className="w-4 h-4" />افزودن محصول</button>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F5F0E8] text-[#8C8175] font-bold"><tr><th className="py-3 px-4 text-right">تصویر</th><th className="py-3 px-4 text-right">نام</th><th className="py-3 px-4 text-right">دسته</th><th className="py-3 px-4 text-right">قیمت</th><th className="py-3 px-4 text-right">رنگ</th><th className="py-3 px-4 text-center">عملیات</th></tr></thead>
                  <tbody className="divide-y divide-[#F5F0E8]">
                    {filteredProds.map(p => {
                      const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : "";
                      const colors = Array.isArray(p.availableColors) ? p.availableColors : [];
                      return (
                        <tr key={p.id} className="hover:bg-[#F5F0E8]/50">
                          <td className="py-2.5 px-4">{img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover" />}</td>
                          <td className="py-2.5 px-4 font-bold max-w-xs truncate">{p.namePersian}</td>
                          <td className="py-2.5 px-4 text-[#8C8175]">{p.category}</td>
                          <td className="py-2.5 px-4 font-black">{formatPrice(p.price)}</td>
                          <td className="py-2.5 px-4"><div className="flex gap-1">{colors.map((c: any, i: number) => <span key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} title={c.name} />)}{colors.length === 0 && <span className="text-[#8C8175]">—</span>}</div></td>
                          <td className="py-2.5 px-4 text-center"><div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openEdit(p)} className="p-1.5 bg-[#F5F0E8] hover:bg-[#7A8E72] hover:text-white rounded-lg transition" title="ویرایش"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteProd(p.id, p.namePersian)} className="p-1.5 bg-red-50 hover:bg-[#A0522D] hover:text-white rounded-lg transition" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS — expanded view with full customer info */}
          {tab === "ords" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {[{ id: "all", l: "همه" }, { id: "pending_payment", l: "انتظار" }, { id: "processing", l: "آماده‌سازی" }, { id: "shipped", l: "ارسال شده" }, { id: "delivered", l: "تحویل شده" }].map(f => (
                    <button key={f.id} onClick={() => setOrderFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${orderFilter === f.id ? "bg-[#3B3228] text-white" : "bg-white text-[#3B3228] hover:bg-[#EBE4D8]"}`}>{f.l}</button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="🔍 جستجوی شماره سفارش یا نام مشتری..."
                    className="bg-white border border-[#EBE4D8] rounded-xl px-4 py-2 text-xs w-full sm:max-w-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]"
                  />
                  <button onClick={exportCSV} className="bg-[#7A8E72] hover:bg-[#5C6F54] text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition shrink-0">
                    <Download className="w-3.5 h-3.5" /> خروجی CSV
                  </button>
                </div>
              </div>

              {filteredOrds.length === 0 ? <p className="bg-white rounded-xl p-8 text-center text-[#8C8175] text-sm">سفارشی یافت نشد.</p> : filteredOrds.map(o => {
                const items = Array.isArray(o.items) ? o.items : [];
                const isExpanded = expandedOrder === o.id;
                const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending_payment;
                return (
                  <div key={o.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE4D8] cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-[#3B3228] text-white font-bold px-2.5 py-0.5 rounded-lg text-xs dir-ltr">{o.orderNumber}</span>
                        <span className="font-bold text-sm">{o.customerName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.c}`}>{st.l}</span>
                        <span className="font-black text-[#6B4226]">{formatPrice(o.totalAmount)}</span>
                        {o.createdAt && <span className="text-[10px] text-[#8C8175]">{toJalali(String(o.createdAt))}</span>}
                      </div>
                      <select value={o.status} onChange={e => { e.stopPropagation(); changeStatus(o.id, e.target.value); }} onClick={e => e.stopPropagation()}
                        className="bg-[#EBE4D8] rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none">
                        <option value="pending_payment">انتظار پرداخت</option>
                        <option value="processing">آماده‌سازی</option>
                        <option value="shipped">ارسال شده</option>
                        <option value="delivered">تحویل شده</option>
                      </select>
                    </div>

                    {isExpanded && (
                      <div className="p-4 space-y-4 bg-[#F5F0E8]/50">
                        {/* Customer info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div><span className="text-[#8C8175] block">نام</span><b>{o.customerName}</b></div>
                          <div><span className="text-[#8C8175] block">تلفن</span><b className="dir-ltr inline-block">{toPersianDigits(o.customerPhone)}</b></div>
                          <div><span className="text-[#8C8175] block">شهر</span><b>{o.customerCity}</b></div>
                          <div><span className="text-[#8C8175] block">کد پستی</span><b className="dir-ltr inline-block">{toPersianDigits(o.customerPostalCode || "—")}</b></div>
                          <div className="col-span-2"><span className="text-[#8C8175] block">آدرس</span><b>{o.customerAddress}</b></div>
                          <div><span className="text-[#8C8175] block">روش پرداخت</span><b>{PAY_LABELS[o.paymentMethod] || o.paymentMethod}</b></div>
                          <div><span className="text-[#8C8175] block">روش ارسال</span><b>{SHIP_LABELS[o.shippingMethod] || o.shippingMethod}</b></div>
                        </div>

                        {/* Items with color info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {items.map((it: any, i: number) => (
                            <div key={i} className="flex items-center gap-2.5 p-2 bg-white rounded-lg">
                              {it.image && <img src={it.image} alt="" className="w-10 h-10 rounded object-cover" />}
                              <div className="text-[11px] flex-1 min-w-0">
                                <span className="font-bold block truncate">{it.namePersian}</span>
                                <span className="text-[#8C8175]">×{toPersianDigits(it.quantity)}</span>
                                {it.size && <span className="text-[#8C8175]"> · {it.size}</span>}
                                {it.color && <span className="text-[#8C8175] flex items-center gap-1"> · <span className="w-3 h-3 rounded-full inline-block border" style={{ backgroundColor: it.color.hex }} />{it.color.name}</span>}
                              </div>
                              <span className="font-black text-[11px]">{formatPrice(it.price * it.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Financial summary */}
                        <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-[#EBE4D8]">
                          <span>جمع کالاها: <b>{formatPrice(o.subtotal)}</b></span>
                          <span>ارسال: <b>{o.shippingCost === 0 ? "رایگان" : formatPrice(o.shippingCost)}</b></span>
                          {o.discountAmount > 0 && <span className="text-[#A0522D]">تخفیف: <b>{formatPrice(o.discountAmount)}</b></span>}
                          <span className="font-black text-[#6B4226]">جمع کل: {formatPrice(o.totalAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* GUIDE */}
          {tab === "guide" && (
            <div className="bg-white rounded-xl p-6 max-w-3xl mx-auto space-y-4">
              <h2 className="text-xl font-black">راهنمای فروش واقعی</h2>
              {[
                { n: "۱", t: "خرید دامنه (.ir)", d: "از iranserver.com ثبت کنید." },
                { n: "۲", t: "استقرار (Liara.ir)", d: "Next.js + PostgreSQL با یک کلیک." },
                { n: "۳", t: "درگاه پرداخت (زرین‌پال)", d: "ثبت‌نام و دریافت Merchant ID." },
                { n: "۴", t: "نماد اعتماد (enamad.ir)", d: "ثبت با آدرس فروشگاه گلپایگان." },
              ].map((s, i) => <div key={i} className="flex gap-3 p-4 bg-[#F5F0E8] rounded-xl"><div className="w-8 h-8 rounded-lg bg-[#3B3228] text-white flex items-center justify-center font-black text-sm shrink-0">{s.n}</div><div><h3 className="font-bold text-sm">{s.t}</h3><p className="text-xs text-[#8C8175]">{s.d}</p></div></div>)}
            </div>
          )}
        </>}
      </div>

      {/* PRODUCT MODAL — multi-image + colors */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full z-10 space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-[#EBE4D8] pb-3">
              <h3 className="font-black">{editing ? "ویرایش محصول" : "افزودن محصول جدید"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#8C8175] hover:text-[#3B3228]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={saveProd} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">نام محصول *</label>
                <input type="text" required value={fName} onChange={e => setFName(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">نام انگلیسی (SEO)</label>
                <input type="text" value={fNameEn} onChange={e => setFNameEn(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7A8E72] dir-ltr text-left" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">دسته‌بندی *</label>
                  <select value={fCat} onChange={e => { setFCat(e.target.value); if (!editing) setFSizes(DEFAULT_SIZES[e.target.value] || ""); }} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#7A8E72]">
                    {UNIQUE_CATS.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">قیمت (تومان) *</label>
                  <input type="number" required value={fPrice} onChange={e => setFPrice(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#7A8E72] dir-ltr text-right" />
                </div>
              </div>

              <div><label className="text-xs font-bold block mb-1">قیمت قبل تخفیف</label><input type="number" value={fOrigPrice} onChange={e => setFOrigPrice(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#7A8E72] dir-ltr text-right" /></div>
              <div><label className="text-xs font-bold block mb-1">توضیح کوتاه *</label><textarea required rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" /></div>
              <div><label className="text-xs font-bold block mb-1">توضیح کامل (اختیاری)</label><textarea rows={3} value={fLongDesc} onChange={e => setFLongDesc(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" /></div>
              <div><label className="text-xs font-bold block mb-1">مشخصات فنی (هر خط: کلید: مقدار)</label><textarea rows={3} value={fSpecs} onChange={e => setFSpecs(e.target.value)} placeholder={"جنس پارچه: پنبه ۱۰۰٪\nابعاد: ۲۰۰×۲۲۰\n..."} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" /></div>
              <div><label className="text-xs font-bold block mb-1">ویژگی‌ها (هر خط یکی)</label><textarea rows={2} value={fFeatures} onChange={e => setFFeatures(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" /></div>
              <div><label className="text-xs font-bold block mb-1">سایزها (هر خط یکی)</label><textarea rows={2} value={fSizes} onChange={e => setFSizes(e.target.value)} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" /></div>

              {/* Multi-image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />تصاویر محصول</label>
                  <label className="text-xs font-bold text-[#7A8E72] cursor-pointer hover:underline flex items-center gap-1">
                    📁 آپلود تصویر
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <textarea rows={3} value={fImages} onChange={e => setFImages(e.target.value)} placeholder={"URL را بچسبانید یا دکمه آپلود را بزنید\nهر خط = یک تصویر"} className="w-full bg-[#F5F0E8] border border-[#EBE4D8] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72] dir-ltr text-left" />
                {fImages.trim() && <div className="flex gap-2 mt-2 overflow-x-auto">{fImages.split("\n").filter(Boolean).map((url, i) => <img key={i} src={url.trim()} alt="" className="w-14 h-14 rounded-lg object-cover border" />)}</div>}
              </div>

              {/* Colors */}
              <div className="bg-[#F5F0E8] rounded-lg p-3 space-y-2">
                <label className="text-xs font-bold flex items-center gap-1"><Palette className="w-3.5 h-3.5" />رنگ‌بندی محصول</label>
                <div className="flex flex-wrap gap-2">
                  {fColors.map((c, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg text-[11px] font-bold">
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button type="button" onClick={() => removeColor(i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 items-end">
                  <input type="text" value={fNewColorName} onChange={e => setFNewColorName(e.target.value)} placeholder="نام رنگ (مثلاً آبی آسمانی)" className="flex-1 bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A8E72]" />
                  <input type="color" value={fNewColorHex} onChange={e => setFNewColorHex(e.target.value)} className="w-10 h-9 rounded-lg border border-[#EBE4D8] cursor-pointer" />
                  <button type="button" onClick={addColor} className="bg-[#7A8E72] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#5C6F54] transition">افزودن</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" checked={fStock} onChange={e => setFStock(e.target.checked)} className="accent-[#7A8E72]" />موجود</label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" checked={fFeatured} onChange={e => setFFeatured(e.target.checked)} className="accent-[#7A8E72]" />ویژه</label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" checked={fBest} onChange={e => setFBest(e.target.checked)} className="accent-[#7A8E72]" />پرفروش</label>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-[#A0522D]"><input type="checkbox" checked={fAmazing} onChange={e => setFAmazing(e.target.checked)} className="accent-[#A0522D]" />پیشنهاد شگفت‌انگیز</label>
                {fAmazing && <input type="datetime-local" value={fAmazingEnd} onChange={e => setFAmazingEnd(e.target.value)} className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 text-xs dir-ltr" />}
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#EBE4D8]">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-[#EBE4D8] text-[#3B3228] font-bold py-2.5 rounded-lg text-xs hover:bg-[#E2DACC] transition">انصراف</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold py-2.5 rounded-lg text-xs transition disabled:opacity-50">{saving ? "ذخیره..." : editing ? "ذخیره" : "افزودن"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
