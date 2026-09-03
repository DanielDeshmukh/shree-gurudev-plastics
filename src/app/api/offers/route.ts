import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const festivalSlug = request.nextUrl.searchParams.get("festival");
    const now = new Date();

    if (!festivalSlug) {
      return NextResponse.json({ offers: [] });
    }

    const where: Record<string, unknown> = {
      isActive: true,
      festivalSlug,
      OR: [
        { deadline: null },
        { deadline: { gt: now } },
      ],
    };

    const offers = await db.offer.findMany({
      where,
      include: {
        products: {
          select: { productId: true },
        },
      },
      orderBy: { discountPct: "desc" },
    });

    const mapped = offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      discountPct: o.discountPct,
      deadline: o.deadline,
      festivalSlug: o.festivalSlug,
      scopeType: o.scopeType,
      scopeValue: o.scopeValue,
      productIds: o.products.map((p) => p.productId),
      productCount: o.products.length,
    }));

    return NextResponse.json({ offers: mapped });
  } catch {
    return NextResponse.json({ offers: [] });
  }
}
