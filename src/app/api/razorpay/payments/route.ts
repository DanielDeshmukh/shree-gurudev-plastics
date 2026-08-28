import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const payments = await db.payment.findMany({
      include: {
        order: {
          select: { id: true, publicId: true, customer: true, phone: true, total: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCollected = payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter((p) => p.status === "created")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalFailed = payments
      .filter((p) => p.status === "failed")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      stats: {
        totalCollected,
        totalPending,
        totalFailed,
        totalCount: payments.length,
        capturedCount: payments.filter((p) => p.status === "captured").length,
        pendingCount: payments.filter((p) => p.status === "created").length,
        failedCount: payments.filter((p) => p.status === "failed").length,
      },
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
