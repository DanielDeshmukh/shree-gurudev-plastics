export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing NEXT_PUBLIC_SITE_URL env variable");
  }
  return "http://localhost:3000";
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${getBaseUrl()}${path}`;
  return fetch(url, { ...init, cache: "no-store" });
}
