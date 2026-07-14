import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const search = searchParams.get("search") || "";

    let baseQuery = db.select().from(products);

    if (search.trim()) {
      // We'll filter in JS since ilike on jsonb may vary. Keep it simple with load & filter.
    }

    const [totalRow] = await db.select({ total: count() }).from(products);
    const total = Number(totalRow?.total ?? 0);

    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Client-side search filter (works for Farsi names)
    let filtered = allProducts;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = allProducts.filter(
        (p) =>
          p.namePersian?.toLowerCase().includes(s) ||
          p.nameEnglish?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s)
      );
    }

    return NextResponse.json({
      products: filtered,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "خطا در دریافت لیست محصولات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      namePersian,
      nameEnglish = "",
      category,
      categorySlug,
      price,
      originalPrice = null,
      shortDescription,
      description,
      features = [],
      specifications = {},
      images = [],
      availableSizes = ["استاندارد"],
      availableColors = [],
      inStock = true,
      isFeatured = false,
      isBestSeller = false,
      isNewArrival = true,
      isAmazingOffer = false,
      amazingOfferEnd = null,
    } = body;

    if (!namePersian || !category || !categorySlug || !price || !shortDescription) {
      return NextResponse.json(
        { error: "نام محصول، دسته‌بندی، قیمت و توضیحات کوتاه الزامی است." },
        { status: 400 }
      );
    }

    // Generate slug from Persian name or timestamp
    const baseSlug = categorySlug + "-" + Date.now().toString().slice(-6);
    const slug = body.slug ? body.slug.trim().toLowerCase() : baseSlug;

    const [createdProduct] = await db
      .insert(products)
      .values({
        slug,
        namePersian: namePersian.trim(),
        nameEnglish: nameEnglish ? nameEnglish.trim() : "Nafis Bedding Item",
        category: category.trim(),
        categorySlug: categorySlug.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        shortDescription: shortDescription.trim(),
        description: description ? description.trim() : shortDescription.trim(),
        features: Array.isArray(features) ? features : [features],
        specifications: typeof specifications === "object" ? (specifications as unknown as Record<string, string>) : {},
        images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"],
        availableSizes: Array.isArray(availableSizes) ? availableSizes : ["استاندارد"],
        availableColors: Array.isArray(availableColors) ? availableColors : [],
        rating: 5.0,
        reviewCount: 0,
        inStock: Boolean(inStock),
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: Boolean(isNewArrival),
        isAmazingOffer: Boolean(isAmazingOffer),
        amazingOfferEnd: amazingOfferEnd || null,
      })
      .returning();

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error) {
    console.error("Admin add product error:", error);
    return NextResponse.json(
      { error: "خطا در افزودن محصول. بررسی کنید اسلاگ تکراری نباشد." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "شناسه کالا (ID) الزامی است." }, { status: 400 });
    }

    const payload: any = {};
    if (updateData.namePersian !== undefined) payload.namePersian = updateData.namePersian.trim();
    if (updateData.nameEnglish !== undefined) payload.nameEnglish = updateData.nameEnglish.trim();
    if (updateData.category !== undefined) payload.category = updateData.category.trim();
    if (updateData.categorySlug !== undefined) payload.categorySlug = updateData.categorySlug.trim();
    if (updateData.price !== undefined) payload.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) payload.originalPrice = updateData.originalPrice ? Number(updateData.originalPrice) : null;
    if (updateData.shortDescription !== undefined) payload.shortDescription = updateData.shortDescription.trim();
    if (updateData.description !== undefined) payload.description = updateData.description.trim();
    if (updateData.features !== undefined) payload.features = updateData.features;
    if (updateData.specifications !== undefined) payload.specifications = updateData.specifications as unknown as Record<string, string>;
    if (updateData.images !== undefined) payload.images = updateData.images;
    if (updateData.availableSizes !== undefined) payload.availableSizes = updateData.availableSizes;
    if (updateData.availableColors !== undefined) payload.availableColors = updateData.availableColors;
    if (updateData.inStock !== undefined) payload.inStock = Boolean(updateData.inStock);
    if (updateData.isFeatured !== undefined) payload.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.isBestSeller !== undefined) payload.isBestSeller = Boolean(updateData.isBestSeller);
    if (updateData.isNewArrival !== undefined) payload.isNewArrival = Boolean(updateData.isNewArrival);
    if (updateData.isAmazingOffer !== undefined) payload.isAmazingOffer = Boolean(updateData.isAmazingOffer);
    if (updateData.amazingOfferEnd !== undefined) payload.amazingOfferEnd = updateData.amazingOfferEnd || null;

    const [updatedProduct] = await db
      .update(products)
      .set(payload)
      .where(eq(products.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json({ error: "خطا در ویرایش اطلاعات محصول." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "شناسه کالا برای حذف الزامی است." }, { status: 400 });
    }

    await db.delete(products).where(eq(products.id, Number(id)));
    return NextResponse.json({ success: true, message: "محصول با موفقیت حذف شد." });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json({ error: "خطا در حذف محصول." }, { status: 500 });
  }
}
