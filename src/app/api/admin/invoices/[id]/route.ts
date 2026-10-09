import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return badRequest("Invalid invoice id");
    const invoice = await db.invoice.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Invoice not found");
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return badRequest("Invalid invoice id");
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.customerGstin !== undefined) data.customerGstin = body.customerGstin;

    const invoice = await db.invoice.update({
      where: { id: numericId },
      data,
      include: { items: true },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Invoice not found");
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return badRequest("Invalid invoice id");
    await db.invoice.delete({ where: { id: numericId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Invoice not found");
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
