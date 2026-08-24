import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

export interface InvoiceItem {
  productName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date | string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerGstin: string | null;
  placeOfSupply: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  notes: string | null;
  orderId: number | null;
  items: InvoiceItem[];
}

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPlain = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (d: Date | string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
};

const formatTime = (d: Date | string) => {
  const dt = new Date(d);
  let h = dt.getHours();
  const m = String(dt.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

async function loadImage(filename: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", filename);
    if (fs.existsSync(filePath)) {
      return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
    }
  } catch {}
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shree-gurudev-plastics.vercel.app";
    const res = await fetch(`${siteUrl}/${filename}`);
    if (res.ok) {
      return `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
    }
  } catch {}
  return null;
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  const receiptW = 560;
  const pad = 24;
  const innerW = receiptW - pad * 2;
  const shadowOffset = 6;

  const headerImg = await loadImage("sgp-header.png");
  const footerImg = await loadImage("sgp-footer.png");

  // Estimate content height
  const headerH = headerImg ? (innerW * 200) / 760 : 100;
  const itemsH = invoice.items.length * 16;
  const contentH =
    30 + headerH + 8 + 16 + // header + gap + dashed
    32 + 16 + // bill info + dashed
    28 + 14 + // table header + dashed
    itemsH + 14 + // items + dashed
    48 + 12 + // totals + dashed
    18 + 42 + 16 + // total + dashed
    52 + 16 + // payment + dashed
    80 + 14 + // bank + dashed
    40 + // footer text
    (footerImg ? 40 : 0) + 20;

  const pageW = receiptW + shadowOffset + 10;
  const pageH = contentH + 20;

  const doc = new jsPDF({
    unit: "pt",
    format: [pageW, pageH],
    compress: false,
  });

  // Shadow (gray, offset)
  doc.setFillColor(190, 190, 190);
  doc.roundedRect(shadowOffset, shadowOffset, receiptW, contentH, 6, 6, "F");

  // White receipt
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(0, 0, receiptW, contentH, 6, 6, "F");

  const rx = pad;
  let y = 30;

  // ── HEADER IMAGE ──
  if (headerImg) {
    doc.addImage(headerImg, "PNG", rx, y, innerW, headerH);
    y += headerH + 8;
  } else {
    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.setTextColor(0, 0, 0);
    doc.text("SGP", receiptW / 2, y + 28, { align: "center" });
    y += 36;
    doc.setFontSize(16);
    doc.setFont("times", "bolditalic");
    doc.text("Shree Gurudev Plastics", receiptW / 2, y, { align: "center" });
    y += 14;
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.text("- All Kind of plastic -", receiptW / 2, y, { align: "center" });
    y += 12;
  }

  // ── DASHED LINE ──
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 16;

  // ── BILL INFO ──
  const col1 = rx;
  const col2 = rx + innerW / 2 + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Bill No.", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1 + 52, y);
  doc.text(invoice.invoiceNumber, col1 + 62, y);
  doc.setFont("helvetica", "bold");
  doc.text("Date", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2 + 45, y);
  doc.text(formatDate(invoice.createdAt), col2 + 55, y);
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.text("Time", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1 + 52, y);
  doc.text(formatTime(invoice.createdAt), col1 + 62, y);
  doc.setFont("helvetica", "bold");
  doc.text("Cashier", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2 + 45, y);
  doc.text("Admin", col2 + 55, y);
  y += 16;

  // ── DASHED LINE ──
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── TABLE HEADER ──
  const cSno = rx;
  const cItem = rx + 30;
  const cHsn = rx + 260;
  const cQty = rx + 320;
  const cRate = rx + 365;
  const cGst = rx + 420;
  const cAmt = rx + 470;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("S.No.", cSno, y);
  doc.text("Item Description", cItem, y);
  doc.text("HSN", cHsn, y);
  doc.text("Qty.", cQty, y);
  doc.text("Rate", cRate, y);
  doc.text("GST %", cGst, y);
  doc.text("Amount", cAmt, y);
  y += 14;

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── ITEMS ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  invoice.items.forEach((item, i) => {
    doc.text(String(i + 1), cSno, y);
    doc.text(item.productName.substring(0, 30), cItem, y);
    doc.text(item.hsnCode || "-", cHsn, y);
    doc.text(String(item.quantity), cQty, y);
    doc.text(fmtPlain(item.unitPrice), cRate, y);
    doc.text(`${item.gstRate}`, cGst, y);
    doc.text(fmtPlain(item.total), cAmt, y);
    y += 16;
  });

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── TOTALS ──
  const tLabelX = rx + 310;
  const tValX = rx + innerW;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Subtotal", tLabelX, y);
  doc.text(fmtPlain(invoice.subtotal), tValX, y, { align: "right" });
  y += 16;

  if (invoice.igst > 0) {
    doc.text(`IGST (${invoice.items[0]?.gstRate || 18}%)`, tLabelX, y);
    doc.text(fmtPlain(invoice.igst), tValX, y, { align: "right" });
    y += 16;
  } else {
    const halfGst = invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 9;
    doc.text(`CGST (${halfGst}%)`, tLabelX, y);
    doc.text(fmtPlain(invoice.cgst), tValX, y, { align: "right" });
    y += 16;
    doc.text(`SGST (${halfGst}%)`, tLabelX, y);
    doc.text(fmtPlain(invoice.sgst), tValX, y, { align: "right" });
    y += 16;
  }

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(tLabelX - 5, y, rx + innerW + 2, y);
  doc.setLineDashPattern([], 0);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL", tLabelX, y);
  doc.text(fmt(invoice.total), tValX, y, { align: "right" });
  y += 18;

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── PAYMENT ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Payment Method", rx, y);
  doc.text(":", rx + 105, y);
  doc.text("Cash", rx + 115, y);
  y += 14;
  doc.text("Amount Paid", rx, y);
  doc.text(":", rx + 105, y);
  doc.text(fmt(invoice.total), rx + 115, y);
  y += 14;
  doc.text("Change", rx, y);
  doc.text(":", rx + 105, y);
  doc.text(fmt(0), rx + 115, y);
  y += 16;

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── BANK DETAILS ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BANK DETAILS", rx, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.text("Bank: State Bank of India", rx, y); y += 12;
  doc.text("A/C No: 12345678901234", rx, y); y += 12;
  doc.text("IFSC: SBIN0001234", rx, y); y += 12;
  doc.text("Branch: Bhayander", rx, y); y += 12;
  if (invoice.customerGstin) {
    doc.text(`GSTIN: ${invoice.customerGstin}`, rx, y); y += 12;
  }
  if (invoice.placeOfSupply) {
    doc.text(`Place of Supply: ${invoice.placeOfSupply}`, rx, y); y += 12;
  }
  y += 8;

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(rx, y, rx + innerW, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── FOOTER ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Thank you for shopping with us!", receiptW / 2, y, { align: "center" });
  y += 13;
  doc.text("Goods once sold will not be taken back or exchanged.", receiptW / 2, y, { align: "center" });
  y += 13;
  doc.text("Visit Again!", receiptW / 2, y, { align: "center" });
  y += 16;

  if (footerImg) {
    const fW = 150;
    const fH = (fW * 40) / 200;
    doc.addImage(footerImg, "PNG", (receiptW - fW) / 2, y, fW, fH);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
