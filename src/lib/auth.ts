import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, getJwtSecret(), { expiresIn: "1d" });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { username: string };
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
