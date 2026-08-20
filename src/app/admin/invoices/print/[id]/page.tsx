import { db } from "@/lib/db";

async function getInvoice(id: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    return invoice;
  } catch {
    return null;
  }
}

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <h1>Invoice not found</h1>
      </div>
    );
  }

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <html>
      <head>
        <title>Invoice {invoice.invoiceNumber}</title>
        <style>{`
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            @page { margin: 15mm; size: A4; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 20px; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 16px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: 700; color: #f97316; }
          .company-details { font-size: 12px; color: #555; line-height: 1.6; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 28px; color: #333; }
          .invoice-title .inv-number { font-size: 14px; color: #666; margin-top: 4px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .meta-box { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px 16px; flex: 1; }
          .meta-box:not(:last-child) { margin-right: 12px; }
          .meta-box h3 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 4px; letter-spacing: 0.5px; }
          .meta-box p { font-size: 13px; color: #333; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f97316; color: white; text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
          th:last-child, td:last-child { text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          tr:nth-child(even) { background: #fafafa; }
          .totals { display: flex; justify-content: flex-end; margin-top: 16px; }
          .totals-box { width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; }
          .totals-row.grand { border-top: 2px solid #f97316; padding-top: 10px; margin-top: 6px; font-size: 18px; font-weight: 700; color: #1a1a1a; }
          .footer { margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 16px; }
          .footer-grid { display: flex; gap: 24px; }
          .footer-box { flex: 1; }
          .footer-box h4 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 4px; letter-spacing: 0.5px; }
          .footer-box p { font-size: 12px; color: #555; line-height: 1.6; }
          .print-btn { position: fixed; bottom: 24px; right: 24px; background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(249,115,22,0.3); z-index: 100; }
          .print-btn:hover { background: #ea580c; }
          .watermark { text-align: center; color: #ddd; font-size: 10px; margin-top: 20px; }
          .status-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
          .status-draft { background: #fef3c7; color: #92400e; }
          .status-issued { background: #dbeafe; color: #1e40af; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
        `}</style>
      </head>
      <body>
        <div className="invoice-container">
          <button className="print-btn no-print" onClick={() => window.print()}>Print Invoice</button>

          <div className="header">
            <div>
              <div className="company-name">Shree Gurudev Plastics</div>
              <div className="company-details">
                Wholesale Plastic Products<br />
                Bhayander (West), Maharashtra<br />
                GSTIN: 27AABFS1234E1Z5<br />
                Phone: +91 85520 84251
              </div>
            </div>
            <div className="invoice-title">
              <h1>TAX INVOICE</h1>
              <div className="inv-number">
                <strong>{invoice.invoiceNumber}</strong><br />
                Date: {formatDate(invoice.createdAt)}
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`status-badge status-${invoice.status}`}>{invoice.status}</span>
              </div>
            </div>
          </div>

          <div className="meta-row">
            <div className="meta-box">
              <h3>Bill To</h3>
              <p>
                <strong>{invoice.customerName}</strong><br />
                {invoice.customerPhone && <>Phone: {invoice.customerPhone}<br /></>}
                {invoice.customerAddress && <>{invoice.customerAddress}<br /></>}
                {invoice.customerGstin && <>GSTIN: {invoice.customerGstin}</>}
              </p>
            </div>
            <div className="meta-box">
              <h3>Place of Supply</h3>
              <p>{invoice.placeOfSupply}</p>
            </div>
            {invoice.orderId && (
              <div className="meta-box">
                <h3>Order Reference</h3>
                <p>#{invoice.orderId}</p>
              </div>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, i: number) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.hsnCode}</td>
                  <td>{item.quantity}</td>
                  <td>{fmt(item.unitPrice)}</td>
                  <td>{item.gstRate}%</td>
                  <td>{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{fmt(invoice.subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>CGST</span>
                <span>{fmt(invoice.cgst)}</span>
              </div>
              <div className="totals-row">
                <span>SGST</span>
                <span>{fmt(invoice.sgst)}</span>
              </div>
              {invoice.igst > 0 && (
                <div className="totals-row">
                  <span>IGST</span>
                  <span>{fmt(invoice.igst)}</span>
                </div>
              )}
              <div className="totals-row grand">
                <span>Total</span>
                <span>{fmt(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: 20, padding: 12, background: "#f9f9f9", borderRadius: 8, fontSize: 12, color: "#555" }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}

          <div className="footer">
            <div className="footer-grid">
              <div className="footer-box">
                <h4>Bank Details</h4>
                <p>
                  Bank: State Bank of India<br />
                  A/C No: 12345678901234<br />
                  IFSC: SBIN0001234<br />
                  Branch: Bhayander
                </p>
              </div>
              <div className="footer-box" style={{ textAlign: "right" }}>
                <h4>Terms & Conditions</h4>
                <p>
                  1. Payment due within 30 days<br />
                  2. Subject to Bhayander jurisdiction<br />
                  3. Goods once sold will not be returned
                </p>
              </div>
            </div>
          </div>

          <div className="watermark">
            This is a computer-generated invoice. For queries, contact +91 85520 84251
          </div>
        </div>
      </body>
    </html>
  );
}
