import PDFDocument from "pdfkit";

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

const COLORS = {
  primary: "#F97316",
  primaryDark: "#EA580C",
  text: "#1A1A1A",
  muted: "#666666",
  light: "#999999",
  border: "#E5E5E5",
  headerBg: "#FFF7ED",
  rowAlt: "#FAFAFA",
  white: "#FFFFFF",
};

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Invoice ${invoice.invoiceNumber}`,
        Author: "Shree Gurudev Plastics",
        Subject: `Tax Invoice ${invoice.invoiceNumber}`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

  const pageW = doc.page.width - 100; // left+right margins
  const col = {
    sno: 30,
    product: 170,
    hsn: 60,
    qty: 40,
    rate: 70,
    gst: 45,
    amount: 85,
  };

  // ── HEADER ──
  doc
    .rect(50, 40, pageW, 2)
    .fill(COLORS.primary);

  doc
    .fontSize(22)
    .fillColor(COLORS.primary)
    .text("SHREE GURUDEV PLASTICS", 50, 50);

  doc
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text("Wholesale Plastic Products", 50, 76)
    .text("Naigaon, Bhayander (West) - 401101, Maharashtra", 50, 88)
    .text("GSTIN: 27AABFS1234E1Z5  |  Phone: +91 85520 84251", 50, 100);

  // Invoice title (right side)
  doc
    .fontSize(20)
    .fillColor(COLORS.text)
    .text("TAX INVOICE", 350, 50, { align: "right", width: pageW - 300 });

  doc
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(invoice.invoiceNumber, 350, 76, { align: "right", width: pageW - 300 })
    .text(`Date: ${formatDate(invoice.createdAt)}`, 350, 88, { align: "right", width: pageW - 300 })
    .text(`Status: ${invoice.status.toUpperCase()}`, 350, 100, { align: "right", width: pageW - 300 });

  let y = 120;

  // ── BILL TO / SUPPLY ──
  const boxW = (pageW - 20) / 2;

  // Bill To box
  doc.roundedRect(50, y, boxW, 70, 4).fill(COLORS.headerBg);
  doc.fontSize(8).fillColor(COLORS.light).text("BILL TO", 60, y + 8);
  doc.fontSize(10).fillColor(COLORS.text)
    .text(invoice.customerName, 60, y + 20, { width: boxW - 20 });
  if (invoice.customerPhone) {
    doc.fontSize(9).fillColor(COLORS.muted)
      .text(`Phone: ${invoice.customerPhone}`, 60, y + 34, { width: boxW - 20 });
  }
  let billY = y + 46;
  if (invoice.customerAddress) {
    doc.fontSize(9).fillColor(COLORS.muted)
      .text(invoice.customerAddress, 60, billY, { width: boxW - 20 });
    billY += 12;
  }
  if (invoice.customerGstin) {
    doc.fontSize(9).fillColor(COLORS.muted)
      .text(`GSTIN: ${invoice.customerGstin}`, 60, billY, { width: boxW - 20 });
  }

  // Supply box
  const supplyX = 50 + boxW + 20;
  doc.roundedRect(supplyX, y, boxW, 70, 4).fill(COLORS.headerBg);
  doc.fontSize(8).fillColor(COLORS.light).text("PLACE OF SUPPLY", supplyX + 10, y + 8);
  doc.fontSize(11).fillColor(COLORS.text)
    .text(invoice.placeOfSupply, supplyX + 10, y + 24);
  if (invoice.orderId) {
    doc.fontSize(9).fillColor(COLORS.muted)
      .text(`Order Ref: #${invoice.orderId}`, supplyX + 10, y + 42);
  }

  y += 84;

  // ── ITEMS TABLE ──
  // Table header
  doc.roundedRect(50, y, pageW, 22, 2).fill(COLORS.primary);
  doc.fontSize(8).fillColor(COLORS.white);
  let x = 56;
  doc.text("#", x, y + 6, { width: col.sno }); x += col.sno;
  doc.text("PRODUCT", x, y + 6, { width: col.product }); x += col.product;
  doc.text("HSN", x, y + 6, { width: col.hsn }); x += col.hsn;
  doc.text("QTY", x, y + 6, { width: col.qty }); x += col.qty;
  doc.text("RATE", x, y + 6, { width: col.rate }); x += col.rate;
  doc.text("GST %", x, y + 6, { width: col.gst }); x += col.gst;
  doc.text("AMOUNT", x, y + 6, { width: col.amount, align: "right" });

  y += 24;

  // Table rows
  invoice.items.forEach((item, i) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }

    const rowH = 20;
    if (i % 2 === 0) {
      doc.rect(50, y, pageW, rowH).fill(COLORS.rowAlt);
    }

    doc.fontSize(9).fillColor(COLORS.text);
    x = 56;
    doc.text(String(i + 1), x, y + 5, { width: col.sno }); x += col.sno;
    doc.text(item.productName, x, y + 5, { width: col.product }); x += col.product;
    doc.text(item.hsnCode, x, y + 5, { width: col.hsn }); x += col.hsn;
    doc.text(String(item.quantity), x, y + 5, { width: col.qty }); x += col.qty;
    doc.text(fmt(item.unitPrice), x, y + 5, { width: col.rate }); x += col.rate;
    doc.text(`${item.gstRate}%`, x, y + 5, { width: col.gst }); x += col.gst;
    doc.text(fmt(item.total), x, y + 5, { width: col.amount, align: "right" });

    y += rowH;
  });

  // Table bottom border
  doc.rect(50, y, pageW, 1).fill(COLORS.border);
  y += 14;

  // ── TOTALS (right-aligned) ──
  const totalsX = 380;
  const totalsW = pageW - (totalsX - 50);

  doc.fontSize(9).fillColor(COLORS.muted);
  doc.text("Subtotal", totalsX, y, { width: totalsW - 90 });
  doc.text(fmt(invoice.subtotal), totalsX, y, { width: totalsW, align: "right" });
  y += 16;

  if (invoice.igst > 0) {
    doc.text(`IGST (${invoice.items[0]?.gstRate || 18}%)`, totalsX, y, { width: totalsW - 90 });
    doc.text(fmt(invoice.igst), totalsX, y, { width: totalsW, align: "right" });
    y += 16;
  } else {
    doc.text("CGST", totalsX, y, { width: totalsW - 90 });
    doc.text(fmt(invoice.cgst), totalsX, y, { width: totalsW, align: "right" });
    y += 16;

    doc.text("SGST", totalsX, y, { width: totalsW - 90 });
    doc.text(fmt(invoice.sgst), totalsX, y, { width: totalsW, align: "right" });
    y += 16;
  }

  // Grand total
  doc.rect(totalsX, y, totalsW, 1).fill(COLORS.primary);
  y += 6;
  doc.fontSize(12).fillColor(COLORS.text);
  doc.font("Helvetica-Bold");
  doc.text("TOTAL", totalsX, y, { width: totalsW - 90 });
  doc.text(fmt(invoice.total), totalsX, y, { width: totalsW, align: "right" });
  doc.font("Helvetica");
  y += 24;

  // ── NOTES ──
  if (invoice.notes) {
    doc.fontSize(9).fillColor(COLORS.muted);
    doc.text(`Notes: ${invoice.notes}`, 50, y, { width: pageW });
    y += 20;
  }

  // ── BANK DETAILS + TERMS ──
  if (y > 680) {
    doc.addPage();
    y = 50;
  }

  doc.rect(50, y, pageW, 1).fill(COLORS.border);
  y += 10;

  const footerColW = (pageW - 20) / 2;

  // Bank details
  doc.fontSize(8).fillColor(COLORS.light).text("BANK DETAILS", 60, y);
  doc.fontSize(9).fillColor(COLORS.muted)
    .text("Bank: State Bank of India", 60, y + 14)
    .text("A/C No: 12345678901234", 60, y + 26)
    .text("IFSC: SBIN0001234", 60, y + 38)
    .text("Branch: Bhayander", 60, y + 50);

  // Terms
  doc.fontSize(8).fillColor(COLORS.light).text("TERMS & CONDITIONS", 60 + footerColW + 20, y);
  doc.fontSize(9).fillColor(COLORS.muted)
    .text("1. Payment due within 30 days", 60 + footerColW + 20, y + 14)
    .text("2. Subject to Bhayander jurisdiction", 60 + footerColW + 20, y + 26)
    .text("3. Goods once sold will not be returned", 60 + footerColW + 20, y + 38);

  // ── SIGNATURE ──
  y += 70;
  doc.fontSize(9).fillColor(COLORS.muted);
  doc.text("For Shree Gurudev Plastics", 50, y, { align: "right", width: pageW });
  y += 30;
  doc.text("Authorized Signatory", 50, y, { align: "right", width: pageW });

  // ── WATERMARK ──
  doc.fontSize(7).fillColor(COLORS.light);
  doc.text(
    "This is a computer-generated invoice. For queries, contact +91 85520 84251",
    50,
    doc.page.height - 35,
    { align: "center", width: pageW }
  );

  doc.end();
}
