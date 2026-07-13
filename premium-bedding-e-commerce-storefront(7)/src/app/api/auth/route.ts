import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Check if a phone number is already registered
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim().replace(/\s/g, "");
    if (!phone) return NextResponse.json({ error: "شماره موبایل الزامی است." }, { status: 400 });

    const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.phone, phone)).limit(1);
    return NextResponse.json({ exists: !!existing });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "خطا در بررسی شماره موبایل" }, { status: 500 });
  }
}

// Register (mode=register) or Login (mode=login) using phone + password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password, name, mode } = body;

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json({ error: "شماره موبایل معتبر وارد کنید." }, { status: 400 });
    }
    if (!password || password.trim().length < 4) {
      return NextResponse.json({ error: "رمز عبور باید حداقل ۴ کاراکتر باشد." }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\s/g, "");
    const [existing] = await db.select().from(customers).where(eq(customers.phone, cleanPhone)).limit(1);

    if (mode === "register") {
      if (existing) {
        return NextResponse.json({ error: "این شماره موبایل قبلاً ثبت‌نام کرده است. لطفاً وارد شوید." }, { status: 409 });
      }
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "نام و نام خانوادگی الزامی است." }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      const [newCustomer] = await db
        .insert(customers)
        .values({ phone: cleanPhone, name: name.trim(), passwordHash })
        .returning();
      const { passwordHash: _, ...safeCustomer } = newCustomer;
      return NextResponse.json({ success: true, customer: safeCustomer });
    }

    // mode === "login"
    if (!existing) {
      return NextResponse.json({ error: "شماره موبایل ثبت‌نام نشده است. لطفاً ابتدا ثبت‌نام کنید." }, { status: 404 });
    }
    const isValid = await bcrypt.compare(password.trim(), existing.passwordHash || "");
    if (!isValid) {
      return NextResponse.json({ error: "رمز عبور اشتباه است." }, { status: 401 });
    }
    const { passwordHash: _, ...safeCustomer } = existing;
    return NextResponse.json({ success: true, customer: safeCustomer });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "خطا در ارتباط با سرور" }, { status: 500 });
  }
}

// Update customer profile
export async function PUT(request: Request) {
  try {
    const { phone, name, city, address, postalCode } = await request.json();
    if (!phone) return NextResponse.json({ error: "شماره موبایل الزامی." }, { status: 400 });

    const payload: any = {};
    if (name !== undefined) payload.name = name.trim();
    if (city !== undefined) payload.city = city.trim();
    if (address !== undefined) payload.address = address.trim();
    if (postalCode !== undefined) payload.postalCode = postalCode.trim();

    const [updated] = await db.update(customers).set(payload).where(eq(customers.phone, phone.trim())).returning();
    const { passwordHash: _, ...safeCustomer } = updated;
    return NextResponse.json({ success: true, customer: safeCustomer });
  } catch (error) {
    return NextResponse.json({ error: "خطا در بروزرسانی" }, { status: 500 });
  }
}
