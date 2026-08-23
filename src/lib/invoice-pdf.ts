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

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

export function generateInvoicePDF(invoice: InvoiceData): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = 595.28;
  const margin = 50;
  const contentW = pageW - margin * 2;

  const orange: [number, number, number] = hexToRgb("#F97316");
  const text: [number, number, number] = hexToRgb("#1A1A1A");
  const muted: [number, number, number] = hexToRgb("#666666");
  const light: [number, number, number] = hexToRgb("#999999");
  const border: [number, number, number] = hexToRgb("#E5E5E5");
  const headerBg: [number, number, number] = hexToRgb("#FFF7ED");
  const rowAlt: [number, number, number] = hexToRgb("#FAFAFA");
  const white: [number, number, number] = hexToRgb("#FFFFFF");

  let y = 50;

  // ── HEADER ──
  doc.setFillColor(...orange);
  doc.rect(margin, 40, contentW, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...orange);
  doc.text("SHREE GURUDEV PLASTICS", margin, y);

  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.text("Wholesale Plastic Products", margin, 76);
  doc.text("Naigaon, Bhayander (West) - 401101, Maharashtra", margin, 88);
  doc.text("GSTIN: 27AABFS1234E1Z5  |  Phone: +91 85520 84251", margin, 100);

  doc.setFontSize(20);
  doc.setTextColor(...text);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", pageW - margin, 50, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, pageW - margin, 76, { align: "right" });
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, pageW - margin, 88, { align: "right" });
  doc.text(`Status: ${invoice.status.toUpperCase()}`, pageW - margin, 100, { align: "right" });

  y = 120;

  // ── BILL TO / SUPPLY ──
  const boxW = (contentW - 20) / 2;

  doc.setFillColor(...headerBg);
  doc.roundedRect(margin, y, boxW, 70, 4, 4, "F");
  doc.setFontSize(8);
  doc.setTextColor(...light);
  doc.text("BILL TO", margin + 10, y + 8);
  doc.setFontSize(10);
  doc.setTextColor(...text);
  doc.text(invoice.customerName, margin + 10, y + 20);
  let billY = y + 34;
  if (invoice.customerPhone) {
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`Phone: ${invoice.customerPhone}`, margin + 10, billY);
    billY += 12;
  }
  if (invoice.customerAddress) {
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(invoice.customerAddress, margin + 10, billY);
    billY += 12;
  }
  if (invoice.customerGstin) {
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`GSTIN: ${invoice.customerGstin}`, margin + 10, billY);
  }

  const supplyX = margin + boxW + 20;
  doc.setFillColor(...headerBg);
  doc.roundedRect(supplyX, y, boxW, 70, 4, 4, "F");
  doc.setFontSize(8);
  doc.setTextColor(...light);
  doc.text("PLACE OF SUPPLY", supplyX + 10, y + 8);
  doc.setFontSize(11);
  doc.setTextColor(...text);
  doc.text(invoice.placeOfSupply, supplyX + 10, y + 24);
  if (invoice.orderId) {
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`Order Ref: #${invoice.orderId}`, supplyX + 10, y + 42);
  }

  y += 84;

  // ── ITEMS TABLE ──
  const col = { sno: 30, product: 170, hsn: 60, qty: 40, rate: 70, gst: 45, amount: 85 };

  doc.setFillColor(...orange);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  let x = margin + 6;
  doc.text("#", x, y + 14); x += col.sno;
  doc.text("PRODUCT", x, y + 14); x += col.product;
  doc.text("HSN", x, y + 14); x += col.hsn;
  doc.text("QTY", x, y + 14); x += col.qty;
  doc.text("RATE", x, y + 14); x += col.rate;
  doc.text("GST %", x, y + 14); x += col.gst;
  doc.text("AMOUNT", x, y + 14);
  doc.setFont("helvetica", "normal");

  y += 24;

  // Table rows
  invoice.items.forEach((item, i) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }

    const rowH = 20;
    if (i % 2 === 0) {
      doc.setFillColor(...rowAlt);
      doc.rect(margin, y, contentW, rowH, "F");
    }

    doc.setFontSize(9);
    doc.setTextColor(...text);
    x = margin + 6;
    doc.text(String(i + 1), x, y + 12); x += col.sno;
    doc.text(item.productName.substring(0, 30), x, y + 12); x += col.product;
    doc.text(item.hsnCode, x, y + 12); x += col.hsn;
    doc.text(String(item.quantity), x, y + 12); x += col.qty;
    doc.text(fmt(item.unitPrice), x, y + 12); x += col.rate;
    doc.text(`${item.gstRate}%`, x, y + 12); x += col.gst;
    doc.text(fmt(item.total), x, y + 12);

    y += rowH;
  });

  doc.setFillColor(...border);
  doc.rect(margin, y, contentW, 1, "F");
  y += 14;

  // ── TOTALS ──
  const totalsX = 380;
  const totalsW = pageW - totalsX - margin;

  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("Subtotal", totalsX, y);
  doc.text(fmt(invoice.subtotal), pageW - margin, y, { align: "right" });
  y += 16;

  if (invoice.igst > 0) {
    doc.text(`IGST (${invoice.items[0]?.gstRate || 18}%)`, totalsX, y);
    doc.text(fmt(invoice.igst), pageW - margin, y, { align: "right" });
    y += 16;
  } else {
    doc.text("CGST", totalsX, y);
    doc.text(fmt(invoice.cgst), pageW - margin, y, { align: "right" });
    y += 16;
    doc.text("SGST", totalsX, y);
    doc.text(fmt(invoice.sgst), pageW - margin, y, { align: "right" });
    y += 16;
  }

  doc.setFillColor(...orange);
  doc.rect(totalsX, y, totalsW, 1, "F");
  y += 6;
  doc.setFontSize(12);
  doc.setTextColor(...text);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", totalsX, y);
  doc.text(fmt(invoice.total), pageW - margin, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 24;

  // ── NOTES ──
  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`Notes: ${invoice.notes}`, margin, y);
    y += 20;
  }

  // ── BANK DETAILS + TERMS ──
  if (y > 680) {
    doc.addPage();
    y = 50;
  }

  doc.setFillColor(...border);
  doc.rect(margin, y, contentW, 1, "F");
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(...light);
  doc.text("BANK DETAILS", margin + 10, y);
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("Bank: State Bank of India", margin + 10, y + 14);
  doc.text("A/C No: 12345678901234", margin + 10, y + 26);
  doc.text("IFSC: SBIN0001234", margin + 10, y + 38);
  doc.text("Branch: Bhayander", margin + 10, y + 50);

  doc.setFontSize(8);
  doc.setTextColor(...light);
  doc.text("TERMS & CONDITIONS", margin + boxW + 30, y);
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("1. Payment due within 30 days", margin + boxW + 30, y + 14);
  doc.text("2. Subject to Bhayander jurisdiction", margin + boxW + 30, y + 26);
  doc.text("3. Goods once sold will not be returned", margin + boxW + 30, y + 38);

  // ── SIGNATURE ──
  y += 70;
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("For Shree Gurudev Plastics", pageW - margin, y, { align: "right" });
  y += 30;
  doc.text("Authorized Signatory", pageW - margin, y, { align: "right" });

  // ── WATERMARK ──
  doc.setFontSize(7);
  doc.setTextColor(...light);
  doc.text(
    "This is a computer-generated invoice. For queries, contact +91 85520 84251",
    pageW / 2,
    815,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
