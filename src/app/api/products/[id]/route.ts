import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id: parseInt(id) },
      include: { brand: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.color !== undefined) data.color = body.color;
    if (body.size !== undefined) data.size = body.size;
    if (body.brandId !== undefined) data.brandId = parseInt(body.brandId);
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.price !== undefined) {
      const newPrice = parseFloat(body.price);
      const existing = await db.product.findUnique({ where: { id: parseInt(id) }, select: { price: true } });
      if (existing && existing.price !== newPrice) {
        await db.priceHistory.create({
          data: {
            productId: parseInt(id),
            oldPrice: existing.price,
            newPrice,
            changedBy: body.changedBy || "admin",
            reason: body.priceReason || null,
          },
        });
      }
      data.price = newPrice;
    }
    if (body.stock !== undefined) data.stock = parseInt(body.stock);
    if (body.category !== undefined) data.category = body.category;
    if (body.description !== undefined) data.description = body.description;
    if (body.moq !== undefined) data.moq = parseInt(body.moq) || 1;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.lowStockThreshold !== undefined) data.lowStockThreshold = parseInt(body.lowStockThreshold) || 10;
    if (body.retailerPrice !== undefined) data.retailerPrice = parseFloat(body.retailerPrice) || 0;
    if (body.dealerPrice !== undefined) data.dealerPrice = parseFloat(body.dealerPrice) || 0;
    if (body.distributorPrice !== undefined) data.distributorPrice = parseFloat(body.distributorPrice) || 0;
    if (body.bulkPrice !== undefined) data.bulkPrice = parseFloat(body.bulkPrice) || 0;
    if (body.height !== undefined) data.height = parseFloat(body.height) || null;
    if (body.width !== undefined) data.width = parseFloat(body.width) || null;
    if (body.depth !== undefined) data.depth = parseFloat(body.depth) || null;
    if (body.weight !== undefined) data.weight = parseFloat(body.weight) || null;

    const product = await db.product.update({
      where: { id: parseInt(id) },
      data,
      include: { brand: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
