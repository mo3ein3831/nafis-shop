import { NextResponse } from "next/server";
import {
  createAdminToken,
  validateAdminCredentials,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth-server";
import { checkRateLimit, getClientIp, RL_ADMIN_LOGIN } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // FIX: Rate-limit admin login attempts
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RL_ADMIN_LOGIN);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌های ورود بیش از حد مجاز. لطفاً یک دقیقه صبر کنید." },
        { status: 429, headers: { "Retry-After": String(rl.resetInSec) } }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    // Create a real JWT token
    const token = await createAdminToken(username.trim());

    const response = NextResponse.json({
      success: true,
      message: "ورود با موفقیت انجام شد.",
    });

    // Set httpOnly cookie for 24 hours
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "خطا در بررسی اطلاعات ورود" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "خروج از حساب انجام شد.",
  });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

// Verify current admin session
export async function GET() {
  // This endpoint is protected by middleware,
  // so if we reach here the token is valid.
  return NextResponse.json({ authenticated: true });
}
