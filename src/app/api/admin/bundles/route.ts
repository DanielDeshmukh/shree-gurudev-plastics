import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const bundles = await db.bundle.findMany({
      include: { items: true },
    }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));
    return NextResponse.json({ bundles });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, description, imageUrl, totalOriginal, bundlePrice, items } = body;

    if (!name || !totalOriginal || !bundlePrice || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const discount = totalOriginal - bundlePrice;

    const bundle = await db.bundle.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        totalOriginal: parseFloat(totalOriginal),
        bundlePrice: parseFloat(bundlePrice),
        discount,
        items: {
          create: items.map((item: { productId: number; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ bundle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, name, description, imageUrl, totalOriginal, bundlePrice, active, items } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (totalOriginal !== undefined) data.totalOriginal = parseFloat(totalOriginal);
    if (bundlePrice !== undefined) data.bundlePrice = parseFloat(bundlePrice);
    if (active !== undefined) data.active = active;

    if (totalOriginal !== undefined && bundlePrice !== undefined) {
      data.discount = parseFloat(totalOriginal) - parseFloat(bundlePrice);
    }

    if (items && Array.isArray(items)) {
      await db.bundleItem.deleteMany({ where: { bundleId: parseInt(id) } });
      for (const item of items) {
        await db.bundleItem.create({
          data: { bundleId: parseInt(id), productId: parseInt(item.productId), quantity: parseInt(item.quantity) || 1 },
        });
      }
    }

    const bundle = await db.bundle.update({ where: { id: parseInt(id) }, data, include: { items: true } });
    return NextResponse.json({ bundle });
  } catch {
    return NextResponse.json({ error: "Failed to update bundle" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.bundle.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete bundle" }, { status: 500 });
  }
}
