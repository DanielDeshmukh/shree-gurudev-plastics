import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { securityLogger } from "@/lib/security-logger";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

  if (pathname.startsWith("/api/auth/admin-register") || pathname.startsWith("/api/auth/signup") || pathname.startsWith("/api/auth/register")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Defense-in-depth: verify admin token for /api/admin/** routes
  if (pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      securityLogger.unauthorizedAccess(pathname, ip);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const payload = verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("admin_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
