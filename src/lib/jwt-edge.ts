// Edge-safe HS256 JWT verification via Web Crypto.
// Tokens are minted by jsonwebtoken in Node route handlers; both sides share
// the same secret, issuer, and audience, so tokens are interchangeable.

const ISSUER = "shreegurudevplastics.com";
const AUDIENCE = "shreegurudevplastics-admin";

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function verifyTokenEdge(token: string): Promise<{ username: string } | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;

    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    if (header.alg !== "HS256") return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${h}.${p}`))
    );
    const actual = b64urlToBytes(s);
    if (sig.length !== actual.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig[i] ^ actual[i];
    if (diff !== 0) return null;

    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    if (payload.iss !== ISSUER || payload.aud !== AUDIENCE) return null;
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (typeof payload.username !== "string") return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}
