import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, ADMIN_COOKIE_NAME } from "@/lib/auth-server";

export const config = {
  matcher: [
    // Protect admin-facing API routes from unauthenticated access
    "/api/admin/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow admin auth endpoint itself (no self-protection loop)
  if (pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  // --- Admin API protection ---
  if (pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز. لطفاً ابتدا وارد شوید." },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.json(
        { error: "نشست منقضی شده است. لطفاً دوباره وارد شوید." },
        { status: 401 }
      );
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
