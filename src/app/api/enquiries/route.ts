import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, productUrl, customerName, customerPhone, message, source } = body;

    if (!productName || !message) {
      return NextResponse.json({ error: "productName and message required" }, { status: 400 });
    }

    const result = await db.execute({
      sql: `INSERT INTO Enquiry (productId, productName, productUrl, customerName, customerPhone, message, source, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))`,
      args: [
        productId ?? null,
        productName,
        productUrl ?? null,
        customerName ?? null,
        customerPhone ?? null,
        message,
        source ?? "whatsapp",
      ],
    });

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch {
    return NextResponse.json({ error: "Failed to log enquiry" }, { status: 500 });
  }
}
