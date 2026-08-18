import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
  }

  const existing = await db.customerUser.findFirst({ where: { phone } });
  if (existing && existing.id !== (session as any).userId) {
    return NextResponse.json({ error: "Phone number already registered with another account" }, { status: 400 });
  }

  await db.customerUser.update({
    where: { id: (session as any).userId },
    data: { phone },
  });

  return NextResponse.json({ success: true });
}
