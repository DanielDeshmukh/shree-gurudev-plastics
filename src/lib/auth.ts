import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

const PEPPER = "shreegurudevplastics";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in .env");
  return secret;
}

export function getAdminUsername(): string {
  const username = process.env.ADMIN_USERNAME;
  if (!username) throw new Error("Missing ADMIN_USERNAME in .env");
  return username;
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("Missing ADMIN_PASSWORD in .env");
  return password;
}

export function pepperPassword(password: string): string {
  return crypto.createHash("sha256").update(PEPPER + password).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const peppered = pepperPassword(password);
  return bcrypt.hash(peppered, 12);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  const peppered = pepperPassword(password);
  return bcrypt.compare(peppered, hashed);
}

const JWT_ISSUER = "shreegurudevplastics.com";
const JWT_AUDIENCE = "shreegurudevplastics-admin";

export function generateToken(username: string): string {
  return jwt.sign({ username }, getJwtSecret(), {
    expiresIn: "1d",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as { username: string };
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.username || null;
}
