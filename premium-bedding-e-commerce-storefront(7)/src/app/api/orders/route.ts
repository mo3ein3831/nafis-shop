import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
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
    } = body;

    if (!customerName || !customerPhone || !customerAddress || items.length === 0) {
      return NextResponse.json(
        { error: "اطلاعات خریدار و اقلام سبد خرید الزامی است." },
        { status: 400 }
      );
    }

    // Calculate totals on server for reliability
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price) * Number(item.quantity);
    }

    let shippingCost = 150000; // default 150,000 Toman
    if (shippingMethod === "express_courier") {
      shippingCost = 180000;
    } else if (shippingMethod === "tipax") {
      shippingCost = 160000;
    } else if (shippingMethod === "post") {
      shippingCost = 120000;
    }

    // Free shipping on orders over 4,000,000 Toman
    if (subtotal >= 4000000) {
      shippingCost = 0;
    }

    let discountAmount = 0;
    if (discountCode && discountCode.toUpperCase() === "NAFIS20") {
      discountAmount = Math.round(subtotal * 0.2); // 20% off
    } else if (discountCode && discountCode.toUpperCase() === "SLEEP10") {
      discountAmount = Math.round(subtotal * 0.1); // 10% off
    }

    const totalAmount = subtotal + shippingCost - discountAmount;

    // Generate order number like NFS-89341
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NFS-${randomNum}`;

    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        customerPostalCode: customerPostalCode ? customerPostalCode.trim() : "0000000000",
        paymentMethod,
        shippingMethod,
        items,
        subtotal,
        shippingCost,
        discountAmount,
        totalAmount,
        status: paymentMethod === "online_gateway" ? "processing" : "pending_payment",
      })
      .returning();

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
        .where(eq(orders.customerPhone, phone))
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
