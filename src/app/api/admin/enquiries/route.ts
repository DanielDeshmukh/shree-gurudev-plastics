import { NextRequest, NextResponse } from "next/server";
import { db, normalizeResult } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const [total, enquiries] = await Promise.all([
      db.enquiry.count({ where }),
      db.enquiry.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          product: {
            select: { price: true, color: true, brand: { select: { name: true } } },
          },
        },
      }),
    ]);

    enquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const mapped = enquiries.map((e) => ({
      ...e,
      productPrice: e.product?.price ?? null,
      productColor: e.product?.color ?? null,
      brandName: e.product?.brand?.name ?? null,
      product: undefined,
    }));

    return NextResponse.json({ enquiries: normalizeResult(mapped), total, limit, offset });
  } catch {
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
