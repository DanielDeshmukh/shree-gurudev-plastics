import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const basePrisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

const SINGLETON_ENFORCE_KEY = "__SGP_ADMIN_SINGLETON__";

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
