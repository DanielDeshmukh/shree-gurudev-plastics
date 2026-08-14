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
    if (body.price !== undefined) data.price = parseFloat(body.price);
    if (body.stock !== undefined) data.stock = parseInt(body.stock);
    if (body.category !== undefined) data.category = body.category;
    if (body.description !== undefined) data.description = body.description;
    if (body.moq !== undefined) data.moq = parseInt(body.moq) || 1;

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
