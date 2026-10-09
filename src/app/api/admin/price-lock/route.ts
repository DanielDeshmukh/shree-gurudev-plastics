import { NextRequest, NextResponse } from "next/server";
import { db, sqliteNow, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locks = await db.priceLock.findMany({
      include: { product: { select: { id: true, name: true, color: true } } },
    }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));

    return NextResponse.json({ locks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch price locks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, lockedPrice, durationHours, notes } = body;

    if (!productId || !lockedPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const expiresDate = new Date();
    expiresDate.setHours(expiresDate.getHours() + (durationHours || 48));
    const expiresAt = expiresDate.toISOString();

    const lock = await db.priceLock.create({
      data: {
        productId: parseInt(productId),
        lockedPrice: parseFloat(lockedPrice),
        expiresAt,
        notes: notes || null,
      },
    });

    return NextResponse.json({ lock }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create price lock" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const numericId = parseId(searchParams.get("id"));

    if (!numericId) {
      return badRequest("Invalid id");
    }

    await db.priceLock.delete({ where: { id: numericId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Price lock not found");
    return NextResponse.json({ error: "Failed to delete price lock" }, { status: 500 });
  }
}
