import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, { limit: 3, windowSec: 60, bucket: "newsletter" });
    if (!rl.allowed) {
      return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز." }, { status: 429 });
    }

    const { phone } = await request.json();
    if (!phone || phone.trim().length < 10) {
      return NextResponse.json({ error: "شماره موبایل معتبر الزامی است." }, { status: 400 });
    }

    // Save subscriber — in production use a proper table
    await db.execute(
      sql`INSERT INTO newsletter_subscribers (phone, created_at) VALUES (${phone.trim()}, now()) ON CONFLICT (phone) DO NOTHING`
    ).catch(() => {
      console.log(`[NEWSLETTER] New subscriber: ${phone.trim()}`);
    });

    return NextResponse.json({ success: true, message: "با موفقیت عضو خبرنامه شدید." });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "خطا در ثبت نام" }, { status: 500 });
  }
}
