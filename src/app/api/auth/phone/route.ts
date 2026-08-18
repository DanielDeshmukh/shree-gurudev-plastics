import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  let userId = token?.userId as number | undefined;

  if (!userId && token?.googleId) {
    try {
      const dbUser = await db.customerUser.findUnique({
        where: { googleId: token.googleId as string },
      });
      if (dbUser) userId = dbUser.id;
    } catch (e) {
      console.error("Phone API: googleId lookup failed:", e);
    }
  }

  if (!userId && token?.email) {
    try {
      const dbUser = await db.customerUser.findUnique({
        where: { email: token.email as string },
      });
      if (dbUser) userId = dbUser.id;
    } catch (e) {
      console.error("Phone API: email lookup failed:", e);
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
  }

  try {
    const existing = await db.customerUser.findFirst({ where: { phone } });
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "Phone number already registered with another account" }, { status: 400 });
    }

    await db.customerUser.update({
      where: { id: userId },
      data: { phone },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to save phone" }, { status: 500 });
  }
}
