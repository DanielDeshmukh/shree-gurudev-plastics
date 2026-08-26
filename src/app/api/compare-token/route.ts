import { NextRequest, NextResponse } from "next/server";
import { encryptCompareIds, decryptCompareIds } from "@/lib/compare-token";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }
    const token = encryptCompareIds(ids.map(Number));
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Failed to encrypt" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
    const ids = decryptCompareIds(token);
    if (!ids) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    return NextResponse.json({ ids });
  } catch {
    return NextResponse.json({ error: "Failed to decrypt" }, { status: 500 });
  }
}
