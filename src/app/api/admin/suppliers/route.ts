import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const suppliers = await db.supplier.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ suppliers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { name, phone, email, address, gstNumber, notes } = body;
    if (!name || !phone) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const supplier = await db.supplier.create({ data: { name, phone, email: email || null, address: address || null, gstNumber: gstNumber || null, notes: notes || null } });
    return NextResponse.json({ supplier }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (fields.name !== undefined) data.name = fields.name;
    if (fields.phone !== undefined) data.phone = fields.phone;
    if (fields.email !== undefined) data.email = fields.email || null;
    if (fields.address !== undefined) data.address = fields.address || null;
    if (fields.gstNumber !== undefined) data.gstNumber = fields.gstNumber || null;
    if (fields.notes !== undefined) data.notes = fields.notes || null;
    const supplier = await db.supplier.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json({ supplier });
  } catch {
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.supplier.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
