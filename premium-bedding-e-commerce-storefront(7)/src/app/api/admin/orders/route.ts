import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, count, sum } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    // Calculate metrics
    let totalRevenue = 0;
    let pendingCount = 0;
    let shippedCount = 0;

    for (const ord of allOrders) {
      if (ord.status !== "pending_payment") {
        totalRevenue += Number(ord.totalAmount);
      }
      if (ord.status === "pending_payment" || ord.status === "processing") {
        pendingCount++;
      }
      if (ord.status === "shipped") {
        shippedCount++;
      }
    }

    return NextResponse.json({
      orders: allOrders,
      metrics: {
        totalOrders: allOrders.length,
        totalRevenue,
        pendingCount,
        shippedCount,
      },
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ error: "خطا در دریافت لیست سفارشات" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "شناسه سفارش و وضعیت جدید الزامی است." },
        { status: 400 }
      );
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Admin update order status error:", error);
    return NextResponse.json({ error: "خطا در تغییر وضعیت سفارش." }, { status: 500 });
  }
}
