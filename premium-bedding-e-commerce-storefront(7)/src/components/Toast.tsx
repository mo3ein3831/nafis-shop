"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export function Toast() {
  const { toast, dismissToast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce sm:animate-none sm:transition-all max-w-sm w-full px-4">
      <div
        className={`flex items-center justify-between p-4 rounded-2xl shadow-xl border ${
          toast.type === "success"
            ? "bg-emerald-950 text-emerald-100 border-emerald-800"
            : toast.type === "error"
            ? "bg-red-950 text-red-100 border-red-800"
            : "bg-stone-900 text-stone-100 border-stone-700"
        }`}
      >
        <div className="flex items-center gap-3">
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold leading-relaxed">
            {toast.message}
          </span>
        </div>
        <button
          onClick={dismissToast}
          className="p-1 hover:bg-white/10 rounded-lg transition ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
