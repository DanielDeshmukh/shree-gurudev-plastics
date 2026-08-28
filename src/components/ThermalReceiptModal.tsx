"use client";

import { useEffect, useState } from "react";
import { MdClose, MdPrint } from "react-icons/md";

const thermalCSS = [
  "body { margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; width: 58mm; }",
  ".receipt { width: 58mm; color: #000; padding: 2mm; }",
  ".row { display: flex; justify-content: space-between; }",
  ".col-qty { width: 15%; text-align: left; }",
  ".col-desc { width: 55%; text-align: left; overflow-wrap: break-word; }",
  ".col-amt { width: 30%; text-align: right; }",
  ".separator { border-top: 1px dashed #000; margin: 8px 0; }",
  ".separator-thin { border-top: 0.5px solid #000; margin: 5px 0; }",
  ".separator-double { border-top: 1px double #000; border-bottom: 1px double #000; height: 4px; margin: 8px 0; }",
  ".center { text-align: center; }",
  ".bold { font-weight: bold; }",
  ".italic { font-style: italic; }",
  ".large-text { font-size: 16px; }",
  ".medium-text { font-size: 14px; }",
  ".small-text { font-size: 12px; }",
  ".x-small-text { font-size: 11px; }",
  ".xx-small-text { font-size: 10px; }",
  ".mt-2 { margin-top: 8px; }",
  ".receipt-header { width: 100%; display: block; margin: 0 auto 4px; }",
  ".receipt-footer { width: 60%; display: block; margin: 4px auto; }",
  "img { max-width: 100%; height: auto; }",
  "@page { size: 58mm auto; margin: 0; }",
].join("\n");

interface InvoiceItem {
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

interface Invoice {
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerGstin: string | null;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  items: InvoiceItem[];
}

export default function ThermalReceiptModal({ invoiceId, onClose }: { invoiceId: number; onClose: () => void }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/invoices/${invoiceId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setInvoice(d.invoice || d))
      .catch(() => setError("Failed to load invoice. Please try again."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const fmt = (n: number) => n.toFixed(2);
  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
  };
  const formatTime = (d: string) => {
    const dt = new Date(d);
    let h = dt.getHours();
    const m = String(dt.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const handlePrint = () => {
    const content = document.getElementById("thermal-receipt-content");
    if (!content) return;

    const pri = document.createElement("iframe");
    pri.style.position = "absolute";
    pri.style.top = "-1000px";
    pri.style.left = "-1000px";
    document.body.appendChild(pri);

    const doc = pri.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write([
      "<!DOCTYPE html><html><head><style>" + thermalCSS + "</style></head><body>",
      '<div class="receipt">' + content.innerHTML + "</div>",
      "</body></html>",
    ].join(""));
    doc.close();

    setTimeout(() => {
      pri.contentWindow?.focus();
      pri.contentWindow?.print();
      if (pri.parentNode === document.body) document.body.removeChild(pri);
    }, 500);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6" onClick={(e) => e.stopPropagation()}>
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-red-400 text-sm mb-4">{error || "Invoice not found"}</p>
          <button onClick={onClose} className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600">Close</button>
        </div>
      </div>
    );
  }

  const halfGst = invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 9;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <MdClose size={20} />
        </button>

        <h3 className="mb-4 text-sm font-bold text-gray-300">Preview</h3>

        {/* Hidden receipt content for printing */}
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

            {invoice.items.map((item, i) => (
              <div key={i} className="item-row x-small-text">
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
              <div className="row small-text">
                <span>IGST ({invoice.items[0]?.gstRate || 18}%)</span>
                <span>{fmt(invoice.igst)}</span>
              </div>
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

        {/* Visible preview - styled like thermal receipt but scaled for screen */}
        <div
          className="mx-auto bg-white text-black p-3 rounded-lg mb-4"
          style={{ width: 220, fontFamily: "'Courier New', monospace", fontSize: 10, lineHeight: 1.3 }}
        >
          <img src="/sgp-header.png" style={{ width: "100%", display: "block", marginBottom: 4 }} alt="SGP" />
          <div style={{ textAlign: "center", fontSize: 9 }}>Ph: +91 85520 84251</div>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 12 }}>TAX INVOICE</div>
          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <div style={{ fontSize: 9 }}>Bill: {invoice.invoiceNumber}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
            <span>Date: {formatDate(invoice.createdAt)}</span>
            <span>Time: {formatTime(invoice.createdAt)}</span>
          </div>
          <div style={{ fontSize: 9 }}>To: {invoice.customerName}</div>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 9 }}>
            <span style={{ width: "15%" }}>QTY</span>
            <span style={{ width: "55%" }}>ITEM</span>
            <span style={{ width: "30%", textAlign: "right" }}>AMT</span>
          </div>
          <div style={{ borderTop: "0.5px solid #000", margin: "3px 0" }} />

          {invoice.items.map((item, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
                <span style={{ width: "15%" }}>{item.quantity}</span>
                <span style={{ width: "55%" }}>{item.productName.toUpperCase()}</span>
                <span style={{ width: "30%", textAlign: "right" }}>{fmt(item.total)}</span>
              </div>
              <div style={{ display: "flex", fontSize: 8, fontStyle: "italic" }}>
                <span style={{ width: "15%" }}></span>
                <span>@ {fmt(item.unitPrice)} x {item.gstRate}% GST</span>
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
            <span>SUBTOTAL</span><span>{fmt(invoice.subtotal)}</span>
          </div>
          {invoice.igst > 0 ? (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
              <span>IGST ({invoice.items[0]?.gstRate || 18}%)</span><span>{fmt(invoice.igst)}</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span>CGST ({halfGst}%)</span><span>{fmt(invoice.cgst)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span>SGST ({halfGst}%)</span><span>{fmt(invoice.sgst)}</span>
              </div>
            </>
          )}

          <div style={{ borderTop: "1px double #000", borderBottom: "1px double #000", height: 4, margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 12 }}>
            <span>TOTAL</span><span>Rs. {fmt(invoice.total)}</span>
          </div>
          <div style={{ borderTop: "1px double #000", borderBottom: "1px double #000", height: 4, margin: "6px 0" }} />

          <div style={{ textAlign: "center", fontSize: 9, marginTop: 6 }}>THANK YOU! VISIT AGAIN</div>
          <img src="/sgp-footer.png" style={{ width: "60%", display: "block", margin: "4px auto" }} alt="" />
          <div style={{ textAlign: "center", fontSize: 8, fontStyle: "italic" }}>Computer Generated Invoice</div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
        >
          <MdPrint size={18} /> Print Receipt
        </button>
      </div>
    </div>
  );
}
