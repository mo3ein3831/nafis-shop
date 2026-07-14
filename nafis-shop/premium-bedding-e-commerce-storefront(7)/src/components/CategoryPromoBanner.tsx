"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CategoryPromoBanner({
  title,
  subtitle,
  image,
  ctaLabel,
  ctaLink,
}: {
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaLink: string;
}) {
  return (
    <section className="relative h-48 sm:h-60 overflow-hidden rounded-2xl mx-4 sm:mx-0">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#3B3228]/60 flex items-center justify-center text-center">
        <div className="px-4">
          <h3 className="text-xl sm:text-3xl font-black text-white mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-white/70 mb-3">{subtitle}</p>
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 bg-white text-[#3B3228] font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm hover:bg-[#EBE4D8] transition-all duration-300 hover:shadow-lg"
          >
            {ctaLabel} <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
