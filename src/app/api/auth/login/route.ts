import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminCount = await db.admin.count();
    if (adminCount !== 1) {
      // Integrity check: exactly 1 admin must exist. If count != 1,
      // something is wrong — refuse login to prevent exploitation.
      console.error(`[SECURITY] Admin count integrity violation: expected 1, got ${adminCount}`);
      return NextResponse.json({ error: "System integrity error" }, { status: 500 });
    }

    const admin = await db.admin.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.password);

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(admin.username);

    const response = NextResponse.json({ success: true, username: admin.username });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
