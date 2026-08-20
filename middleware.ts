import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { securityLogger } from "@/lib/security-logger";

const ALLOWED_ORIGINS = [
  "https://shreegurudevplastics.com",
  "https://shree-gurudev-plastics.vercel.app",
  "http://localhost:3000",
];

// Paths that are always exempt from maintenance redirect
const MAINTENANCE_EXEMPT = [
  "/admin",
  "/api/admin",
  "/api/maintenance",
  "/maintenance",
  "/api/auth/login",
  "/api/auth/logout",
  "/_next",
  "/favicon",
];

// In-memory cache — avoids DB hit on every single request
let maintenanceCache: { enabled: boolean; eta: string | null; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 10_000; // 10 seconds

export function _resetMaintenanceCache() {
  maintenanceCache = null;
}

function getBaseUrl(): string {
  // On Vercel: VERCEL_URL is set automatically (e.g. "shree-gurudev-plastics-xxx.vercel.app")
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Explicit env var
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // Local fallback
  return "http://localhost:3000";
}

async function checkMaintenance(): Promise<{ enabled: boolean; eta: string | null }> {
  const now = Date.now();

  // Serve from cache if fresh
  if (maintenanceCache && now - maintenanceCache.fetchedAt < CACHE_TTL_MS) {
    return { enabled: maintenanceCache.enabled, eta: maintenanceCache.eta };
  }

  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/maintenance/status`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      maintenanceCache = { enabled: !!data.enabled, eta: data.eta || null, fetchedAt: now };
      return maintenanceCache;
    }
  } catch {
    // Fetch failed — don't block the site
  }

  return { enabled: false, eta: null };
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
  const origin = request.headers.get("origin");

  // --- Maintenance mode ---
  const isExempt = MAINTENANCE_EXEMPT.some((prefix) => pathname.startsWith(prefix));
  if (!isExempt && pathname !== "/maintenance") {
    const { enabled, eta } = await checkMaintenance();
    if (enabled) {
      const url = new URL("/maintenance", request.url);
      if (eta) url.searchParams.set("eta", eta);
      return NextResponse.redirect(url);
    }
  }

  // --- CORS preflight ---
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return setCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  // --- Block registration endpoints ---
  if (
    pathname.startsWith("/api/auth/admin-register") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // --- Admin API auth ---
  if (pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      securityLogger.unauthorizedAccess(pathname, ip);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // --- Public API passthrough ---
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    if (pathname.startsWith("/api/")) setCorsHeaders(response, origin);
    return response;
  }

  // --- Admin page auth ---
  if (pathname.startsWith("/admin")) {
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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
