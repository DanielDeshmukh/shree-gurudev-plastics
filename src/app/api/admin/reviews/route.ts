import { NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const username = await getAuthUser();
  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await db.review.findMany({
      include: { product: { select: { name: true } } },
    }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
