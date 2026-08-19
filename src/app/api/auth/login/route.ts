import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken, verifyPassword } from "@/lib/auth";
import { securityLogger } from "@/lib/security-logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { validate, loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { username, password } = validation.data;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    const rateKey = `login:${ip}`;
    const { allowed, remaining, resetAt } = checkRateLimit(rateKey, 5, 60_000);

    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${retryAfter}s` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const adminCount = await db.admin.count();
    if (adminCount !== 1) {
      // Integrity check: exactly 1 admin must exist. If count != 1,
      // something is wrong — refuse login to prevent exploitation.
      console.error(`[SECURITY] Admin count integrity violation: expected 1, got ${adminCount}`);
      return NextResponse.json({ error: "System integrity error" }, { status: 500 });
    }

    const admin = await db.admin.findUnique({ where: { username } });

    if (!admin) {
      securityLogger.loginAttempt(username || "unknown", false, ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.password);

    if (!valid) {
      securityLogger.loginAttempt(username, false, ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    securityLogger.loginAttempt(username, true, ip);
    const token = generateToken(admin.username);

    const response = NextResponse.json({ success: true, username: admin.username });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
