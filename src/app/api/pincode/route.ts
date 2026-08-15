import { NextRequest, NextResponse } from "next/server";
import { checkPincode } from "@/lib/pincodes";

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get("pincode");

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  const info = checkPincode(pincode);

  if (!info) {
    return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
  }

  return NextResponse.json({ pincode: info });
}
