import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products as productsTable } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { checkRateLimit, getClientIp, RL_ORDER } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // FIX: Rate-limit order creation
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RL_ORDER);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "تعداد سفارش‌ها بیش از حد مجاز. لطفاً لحظاتی صبر کنید." },
        { status: 429, headers: { "Retry-After": String(rl.resetInSec) } }
      );
    }

    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerPostalCode,
      paymentMethod = "online_gateway",
      shippingMethod = "express_courier",
      items = [],
      discountCode = "",
      note = "",
      isGift = false,
      giftRecipient = "",
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || items.length === 0) {
      return NextResponse.json(
        { error: "اطلاعات خریدار و اقلام سبد خرید الزامی است." },
        { status: 400 }
      );
    }

    // Validate string lengths to prevent DB overflow
    if (customerName.length > 200) {
      return NextResponse.json({ error: "نام مشتری بیش از حد طولانی است." }, { status: 400 });
    }
    if (customerAddress.length > 500) {
      return NextResponse.json({ error: "آدرس بیش از حد طولانی است." }, { status: 400 });
    }
    if (customerPhone.length > 20) {
      return NextResponse.json({ error: "شماره تماس نامعتبر است." }, { status: 400 });
    }

    // ---- SECURITY FIX: Fetch real prices from DB, never trust client prices ----
    const productIds = items.map((it: any) => Number(it.productId)).filter((id: number) => !isNaN(id) && id > 0);
    if (productIds.length === 0) {
      return NextResponse.json({ error: "شناسه محصولات نامعتبر است." }, { status: 400 });
    }

    const dbProducts = await db
      .select({
        id: productsTable.id,
        slug: productsTable.slug,
        namePersian: productsTable.namePersian,
        price: productsTable.price,
        images: productsTable.images,
        inStock: productsTable.inStock,
      })
      .from(productsTable)
      .where(inArray(productsTable.id, productIds));

    const priceMap = new Map(dbProducts.map((p) => [p.id, p]));
    const validatedItems: Array<{
      productId: number;
      slug: string;
      namePersian: string;
      price: number;
      quantity: number;
      size?: string;
      color?: { name: string; hex: string };
      image: string;
    }> = [];

    let subtotal = 0;

    for (const item of items) {
      const pid = Number(item.productId);
      if (!pid || isNaN(pid)) continue;

      const realProduct = priceMap.get(pid);
      if (!realProduct) {
        return NextResponse.json(
          { error: `محصول با شناسه ${pid} یافت نشد.` },
          { status: 400 }
        );
      }
      if (!realProduct.inStock) {
        return NextResponse.json(
          { error: `محصول «${realProduct.namePersian}» در حال حاضر موجود نیست.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.min(Number(item.quantity) || 1, 99));
      const realPrice = realProduct.price; // Use DB price, not client price
      subtotal += realPrice * qty;

      validatedItems.push({
        productId: realProduct.id,
        slug: realProduct.slug,
        namePersian: realProduct.namePersian,
        price: realPrice,
        quantity: qty,
        size: item.size || undefined,
        color: item.color || undefined,
        image: (realProduct.images as string[])?.[0] || "",
      });
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "هیچ آیتم معتبری در سبد خرید نیست." }, { status: 400 });
    }

    // Calculate shipping
    let shippingCost = 150000;
    if (shippingMethod === "express_courier") shippingCost = 180000;
    else if (shippingMethod === "tipax") shippingCost = 160000;
    else if (shippingMethod === "post") shippingCost = 120000;

    if (subtotal >= 4000000) shippingCost = 0;

    // Calculate discount
    let discountAmount = 0;
    const code = discountCode?.toUpperCase?.() || "";
    if (code === "NAFIS20") discountAmount = Math.round(subtotal * 0.2);
    else if (code === "SLEEP10") discountAmount = Math.round(subtotal * 0.1);

    const totalAmount = subtotal + shippingCost - discountAmount;

    // ---- FIX: Retry logic for unique order number generation ----
    let orderNumber = "";
    let createdOrder: typeof orders.$inferSelect | undefined;
    const MAX_RETRIES = 5;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      orderNumber = `NFS-${randomNum}`;

      try {
        const [result] = await db
          .insert(orders)
          .values({
            orderNumber,
            customerName: customerName.trim().slice(0, 200),
            customerPhone: customerPhone.trim().slice(0, 20),
            customerAddress: customerAddress.trim().slice(0, 500),
            customerCity: (customerCity || "").trim().slice(0, 100),
            customerPostalCode: customerPostalCode
              ? customerPostalCode.trim().slice(0, 20)
              : "0000000000",
            paymentMethod,
            shippingMethod,
            items: validatedItems,
            subtotal,
            shippingCost,
            discountAmount,
            totalAmount,
            status:
              paymentMethod === "online_gateway" ? "processing" : "pending_payment",
            note: note?.trim() || null,
            isGift: !!isGift,
            giftRecipient: isGift ? giftRecipient?.trim() || null : null,
          })
          .returning();

        createdOrder = result;
        break; // success — exit retry loop
      } catch (err: any) {
        // If the error is a unique constraint violation, retry
        const isUniqueViolation =
          err?.message?.includes("unique") ||
          err?.message?.includes("duplicate") ||
          err?.code === "23505";
        if (!isUniqueViolation || attempt === MAX_RETRIES - 1) {
          throw err;
        }
        // Otherwise continue retrying with a new random number
      }
    }

    if (!createdOrder) {
      return NextResponse.json(
        { error: "خطا در تولید شماره سفارش. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    let userOrders;
    if (phone) {
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerPhone, phone.trim().slice(0, 20)))
        .orderBy(desc(orders.createdAt));
    } else {
      userOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(20);
    }

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
