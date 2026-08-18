import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.product.count();
    const sample = await db.product.findFirst({ include: { brand: true } });
    return NextResponse.json({ ok: true, count, sampleName: sample?.name });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      name: error?.name,
      message: error?.message,
      code: error?.code,
      clientVersion: error?.clientVersion,
      meta: error?.meta,
    }, { status: 500 });
  }
}
