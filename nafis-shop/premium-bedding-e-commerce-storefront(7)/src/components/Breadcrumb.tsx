"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="bg-white border-b border-[#EBE4D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-[11px] text-[#9CA3A0] flex items-center gap-1 overflow-x-auto scrollbar-none whitespace-nowrap">
        <Link href="/" className="hover:text-[#6B4226] shrink-0">صفحه اصلی</Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            <ChevronLeft className="w-3 h-3" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[#6B4226]">{item.label}</Link>
            ) : (
              <span className="text-[#3B3228] font-bold truncate max-w-[160px]">{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
