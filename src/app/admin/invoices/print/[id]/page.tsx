import { db } from "@/lib/db";
import ThermalPrintButton from "@/components/ThermalPrintButton";

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
      <html>
        <body style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
          <h1>Invoice not found</h1>
        </body>
      </html>
    );
  }

  const formatDate = (d: Date) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
  };

  const formatTime = (d: Date) => {
    const dt = new Date(d);
    let h = dt.getHours();
    const m = String(dt.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const fmt = (n: number) => n.toFixed(2);

  const halfGst = invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 9;

  return (
    <html>
      <head>
        <title>Invoice {invoice.invoiceNumber}</title>
      </head>
      <body>
        <div id="thermal-receipt-content" style={{ display: "none" }}>
          <div className="receipt">
            <img src="/sgp-header.png" className="receipt-header" alt="SGP" />
            <div className="center x-small-text">Ph: +91 85520 84251</div>

            <div className="separator" />
            <div className="center bold medium-text">TAX INVOICE</div>
            <div className="separator" />

            <div className="row x-small-text">
              <span>Bill: {invoice.invoiceNumber}</span>
            </div>
            <div className="row x-small-text">
              <span>Date: {formatDate(invoice.createdAt)}</span>
              <span>Time: {formatTime(invoice.createdAt)}</span>
            </div>
            <div className="row x-small-text">
              <span>To: {invoice.customerName}</span>
            </div>
            {invoice.customerPhone && <div className="row x-small-text"><span>Ph: {invoice.customerPhone}</span></div>}
            {invoice.customerGstin && <div className="row x-small-text"><span>GSTIN: {invoice.customerGstin}</span></div>}

            <div className="separator" />

            <div className="row bold x-small-text">
              <span className="col-qty">QTY</span>
              <span className="col-desc">ITEM</span>
              <span className="col-amt">AMT</span>
            </div>
            <div className="separator-thin" />

            {invoice.items.map((item: any) => (
              <div key={item.id} className="item-row x-small-text">
                <div className="row">
                  <span className="col-qty">{item.quantity}</span>
                  <span className="col-desc">{item.productName.toUpperCase()}</span>
                  <span className="col-amt">{fmt(item.total)}</span>
                </div>
                <div className="row italic xx-small-text">
                  <span className="col-qty"></span>
                  <span className="col-desc">@ {fmt(item.unitPrice)} x {item.gstRate}% GST</span>
                </div>
              </div>
            ))}

            <div className="separator" />

            <div className="row small-text">
              <span>SUBTOTAL</span>
              <span>{fmt(invoice.subtotal)}</span>
            </div>
            {invoice.igst > 0 ? (
              <>
                <div className="row small-text">
                  <span>IGST ({invoice.items[0]?.gstRate || 18}%)</span>
                  <span>{fmt(invoice.igst)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="row small-text">
                  <span>CGST ({halfGst}%)</span>
                  <span>{fmt(invoice.cgst)}</span>
                </div>
                <div className="row small-text">
                  <span>SGST ({halfGst}%)</span>
                  <span>{fmt(invoice.sgst)}</span>
                </div>
              </>
            )}

            <div className="separator-double" />
            <div className="row bold medium-text">
              <span>TOTAL</span>
              <span>Rs. {fmt(invoice.total)}</span>
            </div>
            <div className="separator-double" />

            <div className="center x-small-text mt-2">THANK YOU! VISIT AGAIN</div>
            <img src="/sgp-footer.png" className="receipt-footer" alt="" />
            <div className="center xx-small-text italic">Computer Generated Invoice</div>
          </div>
        </div>

        <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
          <h2 style={{ marginBottom: 16 }}>Invoice Ready</h2>
          <p style={{ marginBottom: 24, color: "#666" }}>{invoice.invoiceNumber} - Rs. {fmt(invoice.total)}</p>
          <ThermalPrintButton pdfUrl={`/api/admin/invoices/${id}/pdf`} />
        </div>
      </body>
    </html>
  );
}
