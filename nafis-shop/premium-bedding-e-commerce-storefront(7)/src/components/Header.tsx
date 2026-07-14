"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, Search, Menu, X, User, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toPersianDigits } from "@/lib/format";
import { MEGA_GROUPS } from "@/lib/categories";

export function Header() {
  const { totalItems, openCart, wishlist } = useCart();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => { const y = window.scrollY; setVisible(y < lastY.current || y < 80); lastY.current = y; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { try { const s = localStorage.getItem("nafis_customer"); if (s) setCustomer(JSON.parse(s)); } catch (err) { console.error("Error reading customer from localStorage", err); } }, []);

  const openMenu = (name: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); setActiveMenu(name); };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  const doSearch = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { router.push(`/shop?search=${encodeURIComponent(q.trim())}`); setMenuOpen(false); } };

  const activeGroup = MEGA_GROUPS.find(g => g.name === activeMenu);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
        {/* Row 1 */}
        <div className="bg-[#5C6F54] text-white text-center py-1.5 text-[11px] font-medium tracking-wide">
          ✦ ارسال رایگان سفارشات بالای ۴ میلیون تومان &nbsp;|&nbsp; ضمانت بازگشت ۷ روزه &nbsp;|&nbsp; گلپایگان، پاساژ شریفی ✦
        </div>

        {/* Row 2 */}
        <div className="bg-[#F5F0E8]">
          <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-1.5 text-[#3B3228]"><Menu className="w-5 h-5" /></button>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/images/logo.png" alt="نفیس" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-lg font-black text-[#3B3228] hidden sm:block">نَفیس</span>
            </Link>
            <form onSubmit={doSearch} className="hidden sm:flex flex-1 max-w-xl mx-4 items-center bg-white rounded-full overflow-hidden shadow-sm">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو در محصولات نفیس ..." className="flex-1 px-5 py-2.5 text-xs bg-transparent focus:outline-none text-[#3B3228] placeholder:text-[#8C8175]" />
              <button type="submit" className="px-4 text-[#7A8E72] hover:text-[#5C6F54] transition"><Search className="w-4 h-4" /></button>
            </form>
            <div className="flex items-center gap-1">
              <Link href="/auth" className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#3B3228] hover:text-[#6B4226] transition text-xs font-bold group">
                <User className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block">{customer ? (customer.name || "حساب من") : "ورود | ثبت‌نام"}</span>
              </Link>
              <Link href="/wishlist" className="p-2 text-[#3B3228] hover:text-[#A0522D] transition relative group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#A0522D] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{toPersianDigits(wishlist.length)}</span>}
              </Link>
              <button onClick={openCart} className="p-2 text-[#3B3228] hover:text-[#6B4226] transition relative group">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#6B4226] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{toPersianDigits(totalItems)}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Mega menu — state-based, centered panel */}
        <nav className="bg-[#3B3228] hidden lg:block relative" onMouseLeave={scheduleClose}>
          <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center h-11">
            {MEGA_GROUPS.map((group) => (
              <Link
                key={group.name}
                href={`/shop?category=${group.sections[0]?.slug || ""}`}
                onMouseEnter={() => openMenu(group.name)}
                className={`h-11 px-5 text-[13px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeMenu === group.name ? "text-white bg-white/10" : "text-[#EBE4D8] hover:text-white hover:bg-white/5"
                }`}
              >
                {group.name}
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMenu === group.name ? "rotate-180 text-[#9AAF8E]" : "text-[#9AAF8E]/70"}`} />
              </Link>
            ))}
          </div>

          {/* Centered mega panel */}
          {activeGroup && (
            <div
              onMouseEnter={() => openMenu(activeGroup.name)}
              onMouseLeave={scheduleClose}
              className="absolute top-full left-1/2 -translate-x-1/2 w-[min(880px,94vw)] bg-[#F5F0E8] rounded-b-2xl shadow-2xl p-6 z-50 animate-[fadeInUp_0.18s_ease-out] border-t-2 border-[#7A8E72]"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2DACC]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A8E72]" />
                  <h3 className="text-sm font-black text-[#3B3228]">{activeGroup.name}</h3>
                </div>
                <Link href={`/shop?category=${activeGroup.sections[0]?.slug || ""}`} className="text-xs font-bold text-[#6B4226] hover:underline flex items-center gap-1">
                  مشاهده همه <ChevronDown className="w-3 h-3 -rotate-90" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-8">
                {activeGroup.sections.map((section) => (
                  <div key={section.name} className="space-y-2">
                    <Link href={`/shop?category=${section.slug}`} className="block text-xs font-black text-[#5C6F54] hover:text-[#3B3228] border-r-2 border-[#7A8E72] pr-2 transition">
                      {section.name}
                    </Link>
                    {section.items.map((item) => (
                      <Link
                        key={item}
                        href={`/shop?category=${section.slug}&search=${encodeURIComponent(item)}`}
                        className="block text-[11px] text-[#8C8175] hover:text-[#6B4226] hover:bg-white/60 rounded-md px-2 py-1 transition-all hover:-translate-x-0.5"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Spacer — three rows now, no chip row */}
      <div className="h-[92px] lg:h-[104px]" />

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[88vw] max-w-[340px] bg-[#F5F0E8] flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#E2DACC]">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                <img src="/images/logo.png" alt="" className="w-7 h-7 rounded-lg" />
                <span className="font-black text-[#3B3228]">نَفیس</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-[#8C8175] hover:text-[#3B3228] transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={doSearch} className="p-4 border-b border-[#EBE4D8]">
              <div className="flex bg-white rounded-full overflow-hidden shadow-sm">
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو..." className="flex-1 px-4 py-2.5 text-xs bg-transparent focus:outline-none" />
                <button type="submit" className="px-3 text-[#7A8E72]"><Search className="w-4 h-4" /></button>
              </div>
            </form>
            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#6B4226] bg-[#6B4226]/10 mb-3">
                <User className="w-4 h-4" /> {customer ? "حساب کاربری من" : "ورود | ثبت‌نام"}
              </Link>
              {MEGA_GROUPS.map((group) => (
                <details key={group.name} className="group">
                  <summary className="list-none flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-[#3B3228] hover:bg-white/60 cursor-pointer transition">
                    <Link href={`/shop?category=${group.sections[0]?.slug || ""}`} onClick={(e) => e.stopPropagation()} className="flex-1">{group.name}</Link>
                    <ChevronDown className="w-4 h-4 text-[#7A8E72] group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pr-4 pb-2">
                    {group.sections.map((section) => (
                      <div key={section.name} className="mb-1">
                        <Link href={`/shop?category=${section.slug}`} onClick={() => setMenuOpen(false)} className="block px-3 py-1.5 text-xs font-bold text-[#5C6F54]">{section.name}</Link>
                        {section.items.map((item) => (
                          <Link key={item} href={`/shop?category=${section.slug}&search=${encodeURIComponent(item)}`} onClick={() => setMenuOpen(false)}
                            className="block px-3 py-1 text-[11px] text-[#8C8175] hover:text-[#6B4226] transition">{item}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
              <div className="pt-3 mt-3 border-t border-[#E2DACC] space-y-0.5">
                <Link href="/about" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-500 hover:bg-white/60 rounded-lg">درباره ما</Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-500 hover:bg-white/60 rounded-lg">تماس با ما</Link>
                <Link href="/lookup" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-500 hover:bg-white/60 rounded-lg">پیگیری سفارش</Link>
              </div>
            </div>
            <div className="p-3 bg-[#EBE4D8] border-t border-[#E2DACC] text-center text-[10px] text-[#8C8175]">031-57454739 | 09130965236</div>
          </div>
        </div>
      )}
    </>
  );
}
