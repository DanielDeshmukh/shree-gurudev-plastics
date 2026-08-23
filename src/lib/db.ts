import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function toSqliteDateTime(val: unknown): unknown {
  if (val instanceof Date) {
    const y = val.getUTCFullYear();
    const mo = String(val.getUTCMonth() + 1).padStart(2, "0");
    const d = String(val.getUTCDate()).padStart(2, "0");
    const h = String(val.getUTCHours()).padStart(2, "0");
    const mi = String(val.getUTCMinutes()).padStart(2, "0");
    const s = String(val.getUTCSeconds()).padStart(2, "0");
    return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
  }
  if (Array.isArray(val)) return val.map(toSqliteDateTime);
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = toSqliteDateTime(v);
    }
    return out;
  }
  return val;
}

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

const prismaWithDates = basePrisma.$extends({
  query: {
    $allModels: {
      async create({ args, query }) {
        if (args.data) args.data = toSqliteDateTime(args.data) as typeof args.data;
        return query(args);
      },
      async createMany({ args, query }) {
        if (args.data) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((d) => toSqliteDateTime(d)) as typeof args.data;
          } else {
            args.data = toSqliteDateTime(args.data) as typeof args.data;
          }
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data) args.data = toSqliteDateTime(args.data) as typeof args.data;
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create) args.create = toSqliteDateTime(args.create) as typeof args.create;
        if (args.update) args.update = toSqliteDateTime(args.update) as typeof args.update;
        return query(args);
      },
    },
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

export const db = prismaWithDates;
