import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { checkRateLimit, getClientIp, RL_ORDER } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Contact message schema is stored in a simple way using raw SQL
// since we don't have a dedicated table. For production, add a contact_messages table.

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, { ...RL_ORDER, bucket: "contact" });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز." },
        { status: 429, headers: { "Retry-After": String(rl.resetInSec) } }
      );
    }

    const body = await request.json();
    const { name, phone, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "نام، شماره تماس و متن پیام الزامی است." }, { status: 400 });
    }

    if (name.length > 100 || message.length > 2000 || phone.length > 20) {
      return NextResponse.json({ error: "طول فیلدها بیش از حد مجاز." }, { status: 400 });
    }

    // Log contact message (in production, save to DB or email)
    console.log(`[CONTACT] From: ${name} (${phone}): ${message}`);

    // For now we store it in a simple way — in production add a `contact_messages` table
    await db.execute(
      sql`INSERT INTO contact_messages (name, phone, message, created_at) VALUES (${name.trim()}, ${phone.trim()}, ${message.trim()}, now())`
    ).catch(() => {
      // Table might not exist yet — log only
      console.log("[CONTACT] Table not available, logged to console only.");
    });

    return NextResponse.json({ success: true, message: "پیام شما با موفقیت ارسال شد." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "خطا در ارسال پیام" }, { status: 500 });
  }
}
