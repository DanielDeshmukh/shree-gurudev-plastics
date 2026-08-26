"use client";

import { MdPrint, MdFileDownload } from "react-icons/md";

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

export default function ThermalPrintButton({ pdfUrl }: { pdfUrl: string }) {
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
      "<html><head><style>" + thermalCSS + "</style></head><body>",
      '<div class="receipt">' + content.innerHTML + "</div>",
      "</body></html>",
    ].join(""));
    doc.close();

    setTimeout(() => {
      pri.contentWindow?.focus();
      pri.contentWindow?.print();
      document.body.removeChild(pri);
    }, 500);
  };

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      <button
        onClick={handlePrint}
        style={{
          background: "#f97316",
          color: "white",
          border: "none",
          padding: "12px 32px",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <MdPrint size={20} /> Print Receipt
      </button>
      <a
        href={pdfUrl}
        download
        style={{
          background: "#2563EB",
          color: "white",
          border: "none",
          padding: "12px 32px",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <MdFileDownload size={20} /> Download PDF
      </a>
    </div>
  );
}
