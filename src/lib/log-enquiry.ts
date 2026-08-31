export async function logEnquiry(data: {
  productId?: number;
  productName: string;
  productUrl?: string;
  customerName?: string;
  customerPhone?: string;
  message: string;
  source?: string;
}) {
  try {
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {}
}
