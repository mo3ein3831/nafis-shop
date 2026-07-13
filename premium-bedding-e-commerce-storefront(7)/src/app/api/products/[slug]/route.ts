import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq, desc, ne, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await seedDatabase();
    const { slug } = await params;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch product reviews
    const productReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt));

    // Fetch related products in the same category
    const relatedProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.categorySlug, product.categorySlug), ne(products.id, product.id)))
      .limit(4);

    return NextResponse.json({
      product,
      reviews: productReviews,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
