import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    offer: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    offerProduct: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

import { getAuthUser } from "@/lib/auth";
import { GET as listOffers, POST as createOffer } from "@/app/api/admin/offers/route";
import { GET as getOffer, PUT as putOffer, DELETE as delOffer } from "@/app/api/admin/offers/[id]/route";

const req = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => vi.clearAllMocks());

describe("offers routes reject anonymous callers", () => {
  it("GET /api/admin/offers -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await listOffers(req("/api/admin/offers"))).status).toBe(401);
  });
  it("POST /api/admin/offers -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/offers", "http://localhost:3000"), {
      method: "POST",
      body: "{}",
    });
    expect((await createOffer(r)).status).toBe(401);
  });
  it("GET /api/admin/offers/[id] -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await getOffer(req("/api/admin/offers/1"), ctx("1"))).status).toBe(401);
  });
  it("PUT /api/admin/offers/[id] -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/offers/1", "http://localhost:3000"), {
      method: "PUT",
      body: "{}",
    });
    expect((await putOffer(r, ctx("1"))).status).toBe(401);
  });
  it("DELETE /api/admin/offers/[id] -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/offers/1", "http://localhost:3000"), {
      method: "DELETE",
    });
    expect((await delOffer(r, ctx("1"))).status).toBe(401);
  });
});
