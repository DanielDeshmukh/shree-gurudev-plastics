import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, userId, email } = body;

  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
  }

  try {
    let user = null;
    if (userId) {
      user = await db.customerUser.findUnique({ where: { id: userId } });
    }
    if (!user && email) {
      user = await db.customerUser.findUnique({ where: { email } });
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await db.customerUser.findFirst({ where: { phone } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Phone number already registered with another account" }, { status: 400 });
    }

    await db.customerUser.update({
      where: { id: user.id },
      data: { phone },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to save phone" }, { status: 500 });
  }
}
