export interface GSTBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface InvoiceLineItem {
  productName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export function calculateLineItemGST(item: InvoiceLineItem) {
  const lineTotal = item.quantity * item.unitPrice;
  const gstAmount = (lineTotal * item.gstRate) / 100;
  const halfGst = gstAmount / 2;

  return {
    ...item,
    cgst: halfGst,
    sgst: halfGst,
    igst: gstAmount,
    total: lineTotal,
  };
}

export function calculateInvoiceGST(
  items: InvoiceLineItem[],
  placeOfSupply: string
): GSTBreakdown {
  const isInterState = placeOfSupply !== "Maharashtra";

  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  for (const item of items) {
    const lineTotal = item.quantity * item.unitPrice;
    const gstAmount = (lineTotal * item.gstRate) / 100;
    const halfGst = gstAmount / 2;

    subtotal += lineTotal;

    if (isInterState) {
      totalIgst += gstAmount;
    } else {
      totalCgst += halfGst;
      totalSgst += halfGst;
    }
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    cgst: Math.round(totalCgst * 100) / 100,
    sgst: Math.round(totalSgst * 100) / 100,
    igst: Math.round(totalIgst * 100) / 100,
    total: Math.round((subtotal + totalCgst + totalSgst + totalIgst) * 100) / 100,
  };
}

export function generateInvoiceNumber(id: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(id).padStart(4, "0");
  return `SGP/${year}${month}/${seq}`;
}

export const HSN_CODES: Record<string, string> = {
  chairs: "9401",
  tables: "9403",
  buckets: "3924",
  containers: "3924",
  stools: "9401",
  storage: "3924",
  kitchenware: "3924",
  general: "3924",
  bottles: "3923",
  bags: "3926",
  pipes: "3917",
  fittings: "3917",
};

export function getHSNCode(category: string): string {
  return HSN_CODES[category.toLowerCase()] || "3924";
}
