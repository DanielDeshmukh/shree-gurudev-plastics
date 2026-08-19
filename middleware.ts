import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { securityLogger } from "@/lib/security-logger";

const ALLOWED_ORIGINS = [
  "https://shreegurudevplastics.com",
  "https://shree-gurudev-plastics.vercel.app",
  "http://localhost:3000",
];

function setCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const response = new NextResponse(null, { status: 204 });
    return setCorsHeaders(response, origin);
  }

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
    const response = NextResponse.next();
    if (pathname.startsWith("/api/")) setCorsHeaders(response, origin);
    return response;
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
  matcher: ["/admin/:path*", "/api/:path*"],
};
