import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
  }

  try {
    const existing = await db.customerUser.findFirst({ where: { phone } });
    if (existing && existing.id !== (token.userId as number)) {
      return NextResponse.json({ error: "Phone number already registered with another account" }, { status: 400 });
    }

    await db.customerUser.update({
      where: { id: token.userId as number },
      data: { phone },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to save phone" }, { status: 500 });
  }
}
