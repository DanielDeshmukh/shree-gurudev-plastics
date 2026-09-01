import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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
    const body = await request.json();
    const { tier } = body;

    if (!tier) {
      return NextResponse.json({ error: "tier is required" }, { status: 400 });
    }

    const customer = await db.customer.update({
      where: { id: parseInt(id) },
      data: { tier },
    });

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
  }
}
