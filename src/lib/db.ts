import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter } as any);
  }

  return new PrismaClient();
}

const basePrisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

export const db = basePrisma.$extends({
  query: {
    admin: {
      async create({ args, query }) {
        const count = await basePrisma.admin.count();
        if (count >= 1) {
          throw new Error("SECURITY: Only one admin account is permitted.");
        }
        return query(args);
      },
      async upsert({ args, query }) {
        const count = await basePrisma.admin.count();
        if (count >= 1 && !args.where.username) {
          throw new Error("SECURITY: Only one admin account is permitted.");
        }
        return query(args);
      },
    },
  },
}) as unknown as PrismaClient;

export function sqliteNow(): string {
  return new Date().toISOString();
}

export function normalizeDate(val: unknown): string {
  if (!val) return "";
  const s = String(val);
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.\d{3})?Z$/.test(s)) return s;
  const fixed = s
    .replace(/\.\d{3}\+\d{2}:\d{2}$/, ".000Z")
    .replace(/\.\d{3}\.000Z$/, ".000Z")
    .replace(/\+\d{2}:\d{2}$/, ".000Z")
    .replace(/\+000Z$/, ".000Z");
  const d = new Date(fixed);
  return isNaN(d.getTime()) ? s : d.toISOString();
}

export function normalizeResult<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(data)) return normalizeDate(data) as T;
    return data;
  }
  if (Array.isArray(data)) return data.map(normalizeResult) as T;
  if (typeof data === "object" && !(data instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      result[k] = normalizeResult(v);
    }
    return result as T;
  }
  return data;
}

export async function recomputeCustomerStats(customerId: number) {
  const orders = await basePrisma.order.findMany({
    where: { customerId },
    select: { total: true, createdAt: true },
  });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const lastOrderAt = orders.length > 0
    ? orders.reduce((max, o) => o.createdAt > max ? o.createdAt : max, orders[0].createdAt)
    : null;
  await basePrisma.customer.update({
    where: { id: customerId },
    data: { totalOrders, totalSpent, lastOrderAt },
  });
  return { totalOrders, totalSpent, lastOrderAt };
}
