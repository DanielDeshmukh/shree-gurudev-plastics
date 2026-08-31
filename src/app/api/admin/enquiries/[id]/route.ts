import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, note } = body;

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (status) {
      updates.push("status = ?");
      args.push(status);
    }
    if (note !== undefined) {
      updates.push("note = ?");
      args.push(note);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    updates.push("updatedAt = datetime('now')");
    args.push(Number(id));

    await db.execute({
      sql: `UPDATE Enquiry SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}
