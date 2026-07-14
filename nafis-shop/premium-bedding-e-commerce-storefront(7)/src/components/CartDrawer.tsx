"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice, toPersianDigits } from "@/lib/format";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Truck,
  CheckCircle,
} from "lucide-react";

export function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const FREE = 4000000;
  const remaining = Math.max(0, FREE - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={closeCart} />
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#EBE4D8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#7A8E72]" />
              <div>
                <h2 className="font-black text-[#3B3228] text-base">سبد خرید</h2>
                <p className="text-[11px] text-[#9CA3A0]">{toPersianDigits(totalItems)} کالا</p>
              </div>
            </div>
            <button onClick={closeCart} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EBE4D8] rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping bar */}
          <div className="px-4 py-3 bg-[#F5F0E8] border-b border-[#EBE4D8]">
            {remaining > 0 ? (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-[#3B3228] mb-1.5">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#7A8E72]" /> ارسال رایگان</span>
                  <span>{formatPrice(remaining)} مانده</span>
                </div>
                <div className="w-full bg-[#EBE4D8] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#7A8E72] h-full transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#6B4226] font-bold text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>ارسال رایگان 🎁</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-[#7A8E72] mb-3" />
                <h3 className="font-bold text-[#3B3228] mb-1">سبد خرید خالی است</h3>
                <Link href="/shop" onClick={closeCart} className="bg-[#3B3228] text-white font-bold px-5 py-2.5 rounded-xl text-xs mt-4 transition hover:bg-[#6B4226]">
                  مشاهده فروشگاه
                </Link>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${item.color?.name || ""}-${index}`} className="flex gap-3 p-3 bg-[#F5F0E8] border border-[#EBE4D8] rounded-xl">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80"}
                    alt={item.namePersian}
                    className="w-16 h-16 object-cover rounded-lg border border-[#EBE4D8] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-1">
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="font-bold text-xs text-[#3B3228] hover:text-[#6B4226] line-clamp-1">{item.namePersian}</Link>
                      <button onClick={() => removeFromCart(item.productId, item.size, item.color)} className="text-stone-400 hover:text-[#6B4226] p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    {(item.size || item.color) && (
                      <div className="flex gap-1.5 mt-0.5">
                        {item.size && <span className="text-[10px] bg-white border border-[#EBE4D8] text-stone-600 px-1.5 py-0.5 rounded">{item.size}</span>}
                        {item.color && (
                          <span className="text-[10px] bg-white border border-[#EBE4D8] text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full border" style={{ backgroundColor: item.color.hex }} />
                            {item.color.name}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-white border border-[#EBE4D8] rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)} className="p-1 text-stone-600 hover:bg-[#EBE4D8]"><Plus className="w-3 h-3" /></button>
                        <span className="w-6 text-center text-[11px] font-bold text-[#3B3228]">{toPersianDigits(item.quantity)}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)} className="p-1 text-stone-600 hover:bg-[#EBE4D8]"><Minus className="w-3 h-3" /></button>
                      </div>
                      <span className="font-black text-xs text-[#3B3228]">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#EBE4D8] bg-[#F5F0E8] space-y-3">
              <div className="flex justify-between text-sm font-black text-[#3B3228]">
                <span>جمع:</span>
                <span className="text-[#6B4226]">{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={() => { closeCart(); router.push("/checkout"); }}
                className="w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm"
              >
                ثبت سفارش <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={closeCart} className="w-full bg-white text-[#3B3228] font-bold py-2 rounded-xl border border-[#EBE4D8] text-xs transition hover:bg-[#EBE4D8]">
                ادامه خرید
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
