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
  const d = new Date();
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${mi}:${s}`;
}
