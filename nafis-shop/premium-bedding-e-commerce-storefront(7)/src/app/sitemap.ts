import type { MetadataRoute } from "next";
import { MEGA_GROUPS } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nafis-shop.liara.run";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/lookup`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/wishlist`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.3 },
    { url: `${baseUrl}/auth`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/checkout`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
  ];

  // Category pages
  const categoryUrls: MetadataRoute.Sitemap = MEGA_GROUPS.flatMap((group) =>
    group.sections.map((section) => ({
      url: `${baseUrl}/shop?category=${section.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...categoryUrls];
}
