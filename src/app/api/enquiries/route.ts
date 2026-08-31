import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, productUrl, customerName, customerPhone, message, source } = body;

    if (!productName || !message) {
      return NextResponse.json({ error: "productName and message required" }, { status: 400 });
    }

    const result = await db.enquiry.create({
      data: {
        productId: productId ?? null,
        productName,
        productUrl: productUrl ?? null,
        customerName: customerName ?? null,
        customerPhone: customerPhone ?? null,
        message,
        source: source ?? "whatsapp",
        status: "new",
      },
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    console.error("[api/enquiries] POST failed:", e);
    return NextResponse.json({ error: "Failed to log enquiry" }, { status: 500 });
  }
}
