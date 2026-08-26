import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { calculateInvoiceGST, generateInvoiceNumber } from "@/lib/gst";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await db.invoice.findMany({
      include: { items: true },
    }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));

    return NextResponse.json({ invoices });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, customerName, customerPhone, customerAddress, customerGstin, placeOfSupply, items } = body;

    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gstItems: { productName: string; hsnCode: string; quantity: number; unitPrice: number; gstRate: number }[] = items.map((item: { productName: string; hsnCode: string; quantity: number; unitPrice: number; gstRate: number }) => ({
      productName: item.productName,
      hsnCode: item.hsnCode || "3924",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate || 18,
    }));

    const gstBreakdown = calculateInvoiceGST(gstItems, placeOfSupply || "Maharashtra");

    let invoiceStatus = "draft";
    if (orderId) {
      const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
      if (order?.paymentStatus === "paid") invoiceStatus = "paid";
    }

    const invoiceCount = await db.invoice.count();
    const invoiceNumber = generateInvoiceNumber(invoiceCount + 1);

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        orderId: orderId || null,
        customerName,
        customerPhone,
        customerAddress: customerAddress || null,
        customerGstin: customerGstin || null,
        placeOfSupply: placeOfSupply || "Maharashtra",
        subtotal: gstBreakdown.subtotal,
        cgst: gstBreakdown.cgst,
        sgst: gstBreakdown.sgst,
        igst: gstBreakdown.igst,
        total: gstBreakdown.total,
        status: invoiceStatus,
        items: {
          create: gstItems.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            const gstAmount = (lineTotal * item.gstRate) / 100;
            const isInterState = (placeOfSupply || "Maharashtra") !== "Maharashtra";
            return {
              productName: item.productName,
              hsnCode: item.hsnCode,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              gstRate: item.gstRate,
              cgst: isInterState ? 0 : gstAmount / 2,
              sgst: isInterState ? 0 : gstAmount / 2,
              igst: isInterState ? gstAmount : 0,
              total: lineTotal,
            };
          }),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
