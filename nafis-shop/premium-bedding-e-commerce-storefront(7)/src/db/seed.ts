import { db } from "./index";
import { products, collections, reviews, customers, orders } from "./schema";
import { initialProducts, initialCollections, initialReviews } from "./seed-data";
import { count, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { MEGA_GROUPS } from "@/lib/categories";

export async function seedDatabase() {
  try {
    // Collections are idempotent.
    for (const col of initialCollections) {
      await db.insert(collections).values({
        slug: col.slug,
        titlePersian: col.titlePersian,
        subtitlePersian: col.subtitlePersian,
        description: col.description,
        imageUrl: col.imageUrl,
        isFeatured: col.isFeatured,
      }).onConflictDoNothing();
    }

    // Insert missing catalog items only. Existing admin edits are preserved.
    const catalogRows: Array<{ id: number; slug: string; price: number; namePersian: string; images: string[] }> = [];
    for (const prod of initialProducts as any[]) {
      const [existing] = await db.select({ id: products.id, slug: products.slug, price: products.price, namePersian: products.namePersian, images: products.images })
        .from(products).where(eq(products.slug, prod.slug)).limit(1);

      let row = existing;
      if (!row) {
        const [created] = await db.insert(products).values({
          slug: prod.slug,
          namePersian: prod.namePersian,
          nameEnglish: prod.nameEnglish,
          category: prod.category,
          categorySlug: prod.categorySlug,
          price: prod.price,
          originalPrice: prod.originalPrice ?? null,
          shortDescription: prod.shortDescription,
          description: prod.description,
          features: prod.features as string[],
          specifications: prod.specifications as Record<string, string>,
          images: prod.images as string[],
          availableSizes: prod.availableSizes as string[],
          availableColors: prod.availableColors as { name: string; hex: string }[],
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          inStock: prod.inStock,
          isFeatured: prod.isFeatured,
          isBestSeller: prod.isBestSeller,
          isNewArrival: prod.isNewArrival,
          isAmazingOffer: Boolean(prod.isAmazingOffer),
          amazingOfferEnd: prod.amazingOfferEnd ?? null,
        }).returning({ id: products.id, slug: products.slug, price: products.price, namePersian: products.namePersian, images: products.images });
        row = created;

        if (created) {
          const matchingReviews = initialReviews.filter((r) => r.productSlug === prod.slug);
          for (const rev of matchingReviews) {
            await db.insert(reviews).values({
              productId: created.id,
              authorName: rev.authorName,
              authorCity: rev.authorCity,
              rating: rev.rating,
              date: rev.date,
              comment: rev.comment,
              verifiedPurchase: rev.verifiedPurchase,
              helpfulCount: rev.helpfulCount,
            });
          }
        }
      }

      if (row) {
        catalogRows.push({
          id: row.id,
          slug: row.slug,
          price: row.price,
          namePersian: row.namePersian,
          images: (row.images as string[]) || [],
        });
      }
    }

    // Demo customers are idempotent and use the same test password: nafis1234
    const demoPasswordHash = await bcrypt.hash("nafis1234", 10);
    const demoCustomers = [
      { phone: "09121234567", name: "علی محمدی", city: "تهران", address: "خیابان ولیعصر، پلاک ۱۲۰", postalCode: "1234567890" },
      { phone: "09123456789", name: "سارا احمدی", city: "اصفهان - گلپایگان", address: "خیابان امام خمینی، کوچه ۵، پلاک ۸", postalCode: "8791234567" },
      { phone: "09351112233", name: "رضا کریمی", city: "شیراز", address: "بلوار زند، نبش کوچه ۱۴", postalCode: "7134567890" },
      { phone: "09190004455", name: "مریم رضایی", city: "مشهد", address: "بلوار وکیل‌آباد، پلاک ۴۵", postalCode: "9134567890" },
    ];
    for (const demo of demoCustomers) {
      const [existingCustomer] = await db.select({ id: customers.id, passwordHash: customers.passwordHash }).from(customers).where(eq(customers.phone, demo.phone)).limit(1);
      if (!existingCustomer) {
        await db.insert(customers).values({ ...demo, passwordHash: demoPasswordHash }).onConflictDoNothing();
      } else if (!existingCustomer.passwordHash) {
        await db.update(customers).set({ passwordHash: demoPasswordHash }).where(eq(customers.id, existingCustomer.id));
      }
    }

    // Demo orders are inserted only once.
    const [{ value: orderCount }] = await db.select({ value: count() }).from(orders);
    if (orderCount === 0 && catalogRows.length > 0) {
      const pick = (i: number) => catalogRows[i % catalogRows.length];
      const demoOrders = [
        { orderNumber: "NFS-10234", customerName: "علی محمدی", customerPhone: "09121234567", customerAddress: "خیابان ولیعصر، پلاک ۱۲۰", customerCity: "تهران", customerPostalCode: "1234567890", paymentMethod: "online_gateway", shippingMethod: "express_courier", status: "delivered", itemIdx: [0, 1] },
        { orderNumber: "NFS-10298", customerName: "سارا احمدی", customerPhone: "09123456789", customerAddress: "خیابان امام خمینی، کوچه ۵، پلاک ۸", customerCity: "اصفهان - گلپایگان", customerPostalCode: "8791234567", paymentMethod: "card_transfer", shippingMethod: "tipax", status: "shipped", itemIdx: [2] },
        { orderNumber: "NFS-10355", customerName: "رضا کریمی", customerPhone: "09351112233", customerAddress: "بلوار زند، نبش کوچه ۱۴", customerCity: "شیراز", customerPostalCode: "7134567890", paymentMethod: "online_gateway", shippingMethod: "post", status: "processing", itemIdx: [3, 4] },
        { orderNumber: "NFS-10402", customerName: "مریم رضایی", customerPhone: "09190004455", customerAddress: "بلوار وکیل‌آباد، پلاک ۴۵", customerCity: "مشهد", customerPostalCode: "9134567890", paymentMethod: "cash_on_delivery", shippingMethod: "express_courier", status: "pending_payment", itemIdx: [5] },
      ];

      for (const ord of demoOrders) {
        const items = ord.itemIdx.map((i) => {
          const p = pick(i);
          return { productId: p.id, slug: p.slug, namePersian: p.namePersian, price: p.price, quantity: 1, image: p.images[0] || "" };
        });
        const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
        const shippingCost = subtotal >= 4000000 ? 0 : 150000;
        await db.insert(orders).values({
          orderNumber: ord.orderNumber,
          customerName: ord.customerName,
          customerPhone: ord.customerPhone,
          customerAddress: ord.customerAddress,
          customerCity: ord.customerCity,
          customerPostalCode: ord.customerPostalCode,
          paymentMethod: ord.paymentMethod,
          shippingMethod: ord.shippingMethod,
          items,
          subtotal,
          shippingCost,
          discountAmount: 0,
          totalAmount: subtotal + shippingCost,
          status: ord.status,
        }).onConflictDoNothing();
      }
    }

    return { success: true, message: "Database seed is complete." };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
}
