import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { desc, asc, and, gte, lte, eq, ilike, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Ensure db is seeded
    await seedDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const featuredOnly = searchParams.get("featured") === "true";
    const amazingOnly = searchParams.get("amazing") === "true";

    const conditions = [];

    if (category && category !== "all") {
      conditions.push(eq(products.categorySlug, category));
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(products.namePersian, searchTerm),
          ilike(products.nameEnglish, searchTerm),
          ilike(products.shortDescription, searchTerm)
        )
      );
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      conditions.push(gte(products.price, minPrice));
    }

    if (maxPrice !== null && !isNaN(maxPrice)) {
      conditions.push(lte(products.price, maxPrice));
    }

    if (featuredOnly) {
      conditions.push(eq(products.isFeatured, true));
    }
    if (amazingOnly) {
      conditions.push(eq(products.isAmazingOffer, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    if (sort === "price_asc") {
      orderByClause = asc(products.price);
    } else if (sort === "price_desc") {
      orderByClause = desc(products.price);
    } else if (sort === "rating") {
      orderByClause = desc(products.rating);
    } else if (sort === "newest") {
      orderByClause = desc(products.isNewArrival);
    } else {
      // featured / default
      orderByClause = desc(products.isFeatured);
    }

    const allProducts = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderByClause);

    // Global price range (across ALL products, regardless of current filters)
    const [rangeRow] = await db
      .select({ minP: sql<number>`coalesce(min(price),0)::int`, maxP: sql<number>`coalesce(max(price),0)::int` })
      .from(products);

    return NextResponse.json({
      products: allProducts,
      priceRange: { min: rangeRow?.minP ?? 0, max: rangeRow?.maxP ?? 0 },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
