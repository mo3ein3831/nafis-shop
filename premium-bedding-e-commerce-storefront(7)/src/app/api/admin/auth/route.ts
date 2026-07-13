import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Default admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PHONE = "09130965236";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "n@05f@1405s";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    const isValidUser =
      username.trim() === ADMIN_USERNAME ||
      username.trim() === ADMIN_PHONE ||
      username.trim().toLowerCase() === "nafis";

    const isValidPass = password.trim() === ADMIN_PASSWORD;

    if (isValidUser && isValidPass) {
      const response = NextResponse.json({
        success: true,
        message: "ورود با موفقیت انجام شد.",
        token: "nafis_secret_admin_token_2026",
      });

      // Set cookie for 7 days
      response.cookies.set("nafis_admin_token", "nafis_secret_admin_token_2026", {
        httpOnly: false, // exposed so client check works smoothly
        secure: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "خطا در بررسی اطلاعات ورود" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "خروج از حساب انجام شد." });
  response.cookies.delete("nafis_admin_token");
  return response;
}
