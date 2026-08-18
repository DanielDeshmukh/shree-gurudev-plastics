import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.product.count();
    return NextResponse.json({ ok: true, count });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack?.substring(0, 1000),
    }, { status: 500 });
  }
}
