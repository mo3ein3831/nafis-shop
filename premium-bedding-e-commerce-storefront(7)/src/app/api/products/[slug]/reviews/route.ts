import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, avg, count } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { authorName, authorCity, rating, comment } = body;

    if (!authorName || !rating || !comment) {
      return NextResponse.json(
        { error: "نام، امتیاز و متن دیدگاه الزامی است." },
        { status: 400 }
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد." }, { status: 404 });
    }

    // Insert new review
    const [newReview] = await db
      .insert(reviews)
      .values({
        productId: product.id,
        authorName: authorName.trim(),
        authorCity: authorCity ? authorCity.trim() : "ایران",
        rating: Number(rating),
        date: "همین حالا",
        comment: comment.trim(),
        verifiedPurchase: true,
        helpfulCount: 1,
      })
      .returning();

    // Recalculate avg rating & count
    const stats = await db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.productId, product.id));

    const newRating = stats[0]?.averageRating ? Number(stats[0].averageRating).toFixed(1) : Number(rating).toFixed(1);
    const newCount = stats[0]?.totalReviews ? Number(stats[0].totalReviews) : product.reviewCount + 1;

    await db
      .update(products)
      .set({
        rating: Number(newRating),
        reviewCount: newCount,
      })
      .where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      review: newReview,
      newRating: Number(newRating),
      newCount,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "خطا در ثبت دیدگاه" }, { status: 500 });
  }
}
