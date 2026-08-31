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
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.error("[logEnquiry] API returned", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[logEnquiry] failed:", e);
  }
}
