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
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const formatTime = (d: Date | string) => {
  const dt = new Date(d);
  let h = dt.getHours();
  const m = String(dt.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

function loadImage(filename: string): string | null {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, filename);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

export function generateInvoicePDF(invoice: InvoiceData): Buffer {
  const pageW = 860;
  const margin = 50;
  const contentW = pageW - margin * 2;
  const right = pageW - margin;

  const doc = new jsPDF({
    unit: "pt",
    format: [pageW, 1200],
    compress: false,
  });

  let y = 20;

  // ── HEADER IMAGE ──
  const headerImg = loadImage("sgp-header.png");
  if (headerImg) {
    const headerW = contentW;
    const headerH = (headerW * 200) / 860;
    doc.addImage(headerImg, "PNG", margin, y, headerW, headerH);
    y += headerH + 10;
  } else {
    // Fallback text header
    doc.setFont("times", "bold");
    doc.setFontSize(50);
    doc.setTextColor(0, 0, 0);
    doc.text("SGP", pageW / 2, y + 40, { align: "center" });
    y += 55;
    doc.setFontSize(24);
    doc.setFont("times", "bolditalic");
    doc.text("Shree Gurudev Plastics", pageW / 2, y, { align: "center" });
    y += 16;
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.text("- All Kind of plastic -", pageW / 2, y, { align: "center" });
    y += 14;
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text("plastic moulded armless chair \u2022 table \u2022 crate \u2022 mug \u2022 tub \u2022", pageW / 2, y, { align: "center" });
    y += 11;
    doc.text("dustbin \u2022 stool \u2022 storage container \u2022 shoe rack \u2022 baby chair", pageW / 2, y, { align: "center" });
    y += 16;
  }

  // ── DASHED LINE ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 20;

  // ── BILL INFO ──
  const col1 = margin;
  const col2 = margin + 260;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Bill No.", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1 + 60, y);
  doc.text(invoice.invoiceNumber, col1 + 72, y);

  doc.setFont("helvetica", "bold");
  doc.text("Date", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2 + 60, y);
  doc.text(formatDate(invoice.createdAt), col2 + 72, y);
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.text("Time", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1 + 60, y);
  doc.text(formatTime(invoice.createdAt), col1 + 72, y);

  doc.setFont("helvetica", "bold");
  doc.text("Cashier", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2 + 60, y);
  doc.text("Admin", col2 + 72, y);
  y += 20;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 18;

  // ── TABLE HEADER ──
  const cSno = margin;
  const cItem = margin + 45;
  const cHsn = margin + 430;
  const cQty = margin + 520;
  const cRate = margin + 580;
  const cGst = margin + 670;
  const cAmt = margin + 760;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("S.No.", cSno, y);
  doc.text("Item Description", cItem, y);
  doc.text("HSN", cHsn, y);
  doc.text("Qty.", cQty, y);
  doc.text("Rate", cRate, y);
  doc.text("GST %", cGst, y);
  doc.text("Amount", cAmt, y);
  y += 16;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 18;

  // ── ITEMS ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  invoice.items.forEach((item, i) => {
    if (y > 1100) {
      doc.addPage();
      y = 50;
    }
    doc.text(String(i + 1), cSno, y);
    doc.text(item.productName.substring(0, 40), cItem, y);
    doc.text(item.hsnCode || "-", cHsn, y);
    doc.text(String(item.quantity), cQty, y);
    doc.text(fmtPlain(item.unitPrice), cRate, y);
    doc.text(`${item.gstRate}`, cGst, y);
    doc.text(fmtPlain(item.total), cAmt, y);
    y += 20;
  });

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 20;

  // ── TOTALS ──
  const totalsLabelX = margin + 500;
  const totalsValX = right;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Subtotal", totalsLabelX, y);
  doc.text(fmtPlain(invoice.subtotal), totalsValX, y, { align: "right" });
  y += 20;

  if (invoice.igst > 0) {
    doc.text(`IGST (${invoice.items[0]?.gstRate || 18}%)`, totalsLabelX, y);
    doc.text(fmtPlain(invoice.igst), totalsValX, y, { align: "right" });
    y += 20;
  } else {
    const halfGst = invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 9;
    doc.text(`CGST (${halfGst}%)`, totalsLabelX, y);
    doc.text(fmtPlain(invoice.cgst), totalsValX, y, { align: "right" });
    y += 20;
    doc.text(`SGST (${halfGst}%)`, totalsLabelX, y);
    doc.text(fmtPlain(invoice.sgst), totalsValX, y, { align: "right" });
    y += 20;
  }

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(totalsLabelX - 10, y, right + 5, y);
  doc.setLineDashPattern([], 0);
  y += 16;

  // ── TOTAL ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL", totalsLabelX, y);
  doc.text(fmt(invoice.total), totalsValX, y, { align: "right" });
  y += 24;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 20;

  // ── PAYMENT ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Payment Method", margin, y);
  doc.text(":", margin + 120, y);
  doc.text("Cash", margin + 135, y);
  y += 18;

  doc.text("Amount Paid", margin, y);
  doc.text(":", margin + 120, y);
  doc.text(fmt(invoice.total), margin + 135, y);
  y += 18;

  doc.text("Change", margin, y);
  doc.text(":", margin + 120, y);
  doc.text(fmt(0), margin + 135, y);
  y += 20;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 20;

  // ── BANK DETAILS + GST INFO ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BANK DETAILS", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.text("Bank: State Bank of India", margin, y); y += 14;
  doc.text("A/C No: 12345678901234", margin, y); y += 14;
  doc.text("IFSC: SBIN0001234", margin, y); y += 14;
  doc.text("Branch: Bhayander", margin, y); y += 14;
  if (invoice.customerGstin) {
    doc.text(`GSTIN: ${invoice.customerGstin}`, margin, y); y += 14;
  }
  if (invoice.placeOfSupply) {
    doc.text(`Place of Supply: ${invoice.placeOfSupply}`, margin, y); y += 14;
  }
  y += 10;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 20;

  // ── FOOTER TEXT ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Thank you for shopping with us!", pageW / 2, y, { align: "center" });
  y += 16;
  doc.text("Goods once sold will not be taken back or exchanged.", pageW / 2, y, { align: "center" });
  y += 16;
  doc.text("Visit Again!", pageW / 2, y, { align: "center" });
  y += 20;

  // ── FOOTER IMAGE ──
  const footerImg = loadImage("sgp-footer.png");
  if (footerImg) {
    const footerW = 200;
    const footerH = (footerW * 40) / 200;
    doc.addImage(footerImg, "PNG", (pageW - footerW) / 2, y, footerW, footerH);
    y += footerH + 10;
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
