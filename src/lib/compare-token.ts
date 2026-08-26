import crypto from "crypto";

const SECRET = process.env.COMPARE_TOKEN_SECRET || "shree-gurudev-plastics-compare-2024-secret-key";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(SECRET).digest();
}

export function encryptCompareIds(ids: number[]): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const data = JSON.stringify(ids);
  let encrypted = cipher.update(data, "utf8", "base64url");
  encrypted += cipher.final("base64url");
  return `${iv.toString("base64url")}.${encrypted}`;
}

export function decryptCompareIds(token: string): number[] | null {
  try {
    const key = getKey();
    const [ivStr, encrypted] = token.split(".");
    if (!ivStr || !encrypted) return null;
    const iv = Buffer.from(ivStr, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "base64url", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}
