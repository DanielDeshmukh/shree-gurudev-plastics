import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    let where = "WHERE 1=1";
    const args: (string | number)[] = [];

    if (status && status !== "all") {
      where += " AND e.status = ?";
      args.push(status);
    }
    if (search) {
      where += " AND (e.productName LIKE ? OR e.customerName LIKE ? OR e.customerPhone LIKE ?)";
      const q = `%${search}%`;
      args.push(q, q, q);
    }

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM Enquiry e ${where}`,
      args,
    });
    const total = Number(countResult.rows[0]?.total ?? 0);

    const result = await db.execute({
      sql: `SELECT e.*, p.price as productPrice, p.color as productColor, b.name as brandName
            FROM Enquiry e
            LEFT JOIN Product p ON p.id = e.productId
            LEFT JOIN Brand b ON b.id = p.brandId
            ${where}
            ORDER BY e.createdAt DESC
            LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({ enquiries: result.rows, total, limit, offset });
  } catch {
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
