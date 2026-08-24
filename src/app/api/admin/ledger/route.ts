import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = parseInt(customerId);

    const entries = await db.ledgerEntry.findMany({
      where,
      take: 200,
    }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));

    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { customerId, orderId, type, amount, description, referenceNo } = body;

    if (!customerId || !type || !amount || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lastEntryCandidates = await db.ledgerEntry.findMany({
      where: { customerId: parseInt(customerId) },
      select: { balance: true, createdAt: true },
    });
    const lastEntry = lastEntryCandidates.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime())[0] || null;

    const prevBalance = lastEntry?.balance || 0;
    let newBalance = prevBalance;

    switch (type) {
      case "credit":
        newBalance = prevBalance + parseFloat(amount);
        break;
      case "debit":
        newBalance = prevBalance - parseFloat(amount);
        break;
      case "payment":
        newBalance = prevBalance + parseFloat(amount);
        break;
    }

    const entry = await db.ledgerEntry.create({
      data: {
        customerId: parseInt(customerId),
        orderId: orderId ? parseInt(orderId) : null,
        type,
        amount: parseFloat(amount),
        balance: newBalance,
        description,
        referenceNo: referenceNo || null,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ledger entry" }, { status: 500 });
  }
}
