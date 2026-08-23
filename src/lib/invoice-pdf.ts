import { jsPDF } from "jspdf";

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

export function generateInvoicePDF(invoice: InvoiceData): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: false });
  const pageW = 595.28;
  const margin = 50;
  const contentW = pageW - margin * 2;
  const right = pageW - margin;

  let y = 30;

  // ── SGP LOGO TEXT ──
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(".o.", pageW / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(50);
  doc.text("SGP", pageW / 2, y + 40, { align: "center" });
  y += 55;

  // ── COMPANY NAME ──
  doc.setFontSize(24);
  doc.setFont("times", "bolditalic");
  doc.text("Shree Gurudev Plastics", pageW / 2, y, { align: "center" });
  y += 16;

  // ── TAGLINE ──
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.text("- All Kind of plastic -", pageW / 2, y, { align: "center" });
  y += 14;

  // ── PRODUCT CATEGORIES ──
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  const cats = "plastic moulded armless chair \u2022 table \u2022 crate \u2022 mug \u2022 tub \u2022";
  const cats2 = "dustbin \u2022 stool \u2022 storage container \u2022 shoe rack \u2022 baby chair";
  doc.text(cats, pageW / 2, y, { align: "center" });
  y += 11;
  doc.text(cats2, pageW / 2, y, { align: "center" });
  y += 16;

  // ── DASHED LINE ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 18;

  // ── BILL INFO ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Bill No.", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", margin + 50, y);
  doc.text(invoice.invoiceNumber, margin + 60, y);

  doc.setFont("helvetica", "bold");
  doc.text("Date", margin + 250, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", margin + 290, y);
  doc.text(formatDate(invoice.createdAt), margin + 300, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.text("Time", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", margin + 50, y);
  doc.text(formatTime(invoice.createdAt), margin + 60, y);

  doc.setFont("helvetica", "bold");
  doc.text("Cashier", margin + 250, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", margin + 290, y);
  doc.text("Admin", margin + 300, y);
  y += 18;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 16;

  // ── TABLE HEADER ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("S.No.", margin, y);
  doc.text("Item Description", margin + 40, y);
  doc.text("HSN", margin + 280, y);
  doc.text("Qty.", margin + 330, y);
  doc.text("Rate", margin + 380, y);
  doc.text("GST %", margin + 430, y);
  doc.text("Amount", margin + 490, y);
  y += 14;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 16;

  // ── ITEMS ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  invoice.items.forEach((item, i) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(String(i + 1), margin, y);
    doc.text(item.productName.substring(0, 35), margin + 40, y);
    doc.text(item.hsnCode || "-", margin + 280, y);
    doc.text(String(item.quantity), margin + 330, y);
    doc.text(fmtPlain(item.unitPrice), margin + 380, y);
    doc.text(`${item.gstRate}`, margin + 430, y);
    doc.text(fmtPlain(item.total), margin + 490, y);
    y += 18;
  });

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 18;

  // ── TOTALS ──
  const totalsLabelX = margin + 300;
  const totalsValX = margin + 490;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Subtotal", totalsLabelX, y);
  doc.text(fmtPlain(invoice.subtotal), totalsValX, y, { align: "right" });
  y += 18;

  if (invoice.igst > 0) {
    doc.text(`IGST (${invoice.items[0]?.gstRate || 18}%)`, totalsLabelX, y);
    doc.text(fmtPlain(invoice.igst), totalsValX, y, { align: "right" });
    y += 18;
  } else {
    doc.text(`CGST (${invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 9}%)`, totalsLabelX, y);
    doc.text(fmtPlain(invoice.cgst), totalsValX, y, { align: "right" });
    y += 18;
    doc.text(`SGST (${invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 9}%)`, totalsLabelX, y);
    doc.text(fmtPlain(invoice.sgst), totalsValX, y, { align: "right" });
    y += 18;
  }

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(totalsLabelX - 10, y, right + 5, y);
  doc.setLineDashPattern([], 0);
  y += 14;

  // ── TOTAL ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL", totalsLabelX, y);
  doc.text(fmt(invoice.total), totalsValX, y, { align: "right" });
  y += 20;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 18;

  // ── PAYMENT ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Payment Method", margin, y);
  doc.text(":", margin + 110, y);
  doc.text("Cash", margin + 120, y);
  y += 16;

  doc.text("Amount Paid", margin, y);
  doc.text(":", margin + 110, y);
  doc.text(fmt(invoice.total), margin + 120, y);
  y += 16;

  doc.text("Change", margin, y);
  doc.text(":", margin + 110, y);
  doc.text(fmt(0), margin + 120, y);
  y += 18;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 22;

  // ── BANK DETAILS ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BANK DETAILS", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Bank: State Bank of India", margin, y);
  y += 12;
  doc.text("A/C No: 12345678901234", margin, y);
  y += 12;
  doc.text("IFSC: SBIN0001234", margin, y);
  y += 12;
  doc.text("Branch: Bhayander", margin, y);
  y += 12;

  // ── TERMS ──
  if (invoice.customerGstin) {
    doc.text(`GSTIN: ${invoice.customerGstin}`, margin, y);
    y += 12;
  }
  if (invoice.placeOfSupply) {
    doc.text(`Place of Supply: ${invoice.placeOfSupply}`, margin, y);
    y += 12;
  }
  y += 8;

  // ── DASHED LINE ──
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, right, y);
  doc.setLineDashPattern([], 0);
  y += 16;

  // ── FOOTER ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Thank you for shopping with us!", pageW / 2, y, { align: "center" });
  y += 14;
  doc.text("Goods once sold will not be taken back or exchanged.", pageW / 2, y, { align: "center" });
  y += 14;
  doc.text("Visit Again!", pageW / 2, y, { align: "center" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
