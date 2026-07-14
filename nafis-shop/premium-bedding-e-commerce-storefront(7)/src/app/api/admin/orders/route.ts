import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const statusFilter = searchParams.get("status") || "";

    // Count total & calculate metrics across ALL orders
    const [metricsRow] = await db
      .select({
        total: count(),
        totalRevenue: sql<number>`coalesce(sum(case when status != 'pending_payment' then total_amount else 0 end), 0)::int`,
        pendingCount: sql<number>`coalesce(sum(case when status in ('pending_payment','processing') then 1 else 0 end), 0)::int`,
        shippedCount: sql<number>`coalesce(sum(case when status = 'shipped' then 1 else 0 end), 0)::int`,
      })
      .from(orders);

    const total = Number(metricsRow?.total ?? 0);
    const metrics = {
      totalOrders: total,
      totalRevenue: Number(metricsRow?.totalRevenue ?? 0),
      pendingCount: Number(metricsRow?.pendingCount ?? 0),
      shippedCount: Number(metricsRow?.shippedCount ?? 0),
    };

    // Fetch paginated orders
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      orders: statusFilter
        ? allOrders.filter((o) => o.status === statusFilter)
        : allOrders,
      metrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
