import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    product: { findMany: vi.fn().mockResolvedValue([]) },
    enquiry: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    },
  },
  normalizeResult: (x: unknown) => x,
}));

import { getAuthUser } from "@/lib/auth";
import { GET as offersProducts } from "@/app/api/admin/offers/products/route";
import { GET as listEnquiries } from "@/app/api/admin/enquiries/route";
import { PATCH as patchEnquiry } from "@/app/api/admin/enquiries/[id]/route";

const get = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));

beforeEach(() => vi.clearAllMocks());

describe("remaining unauthenticated admin routes", () => {
  it("offers/products GET -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await offersProducts(get("/api/admin/offers/products"))).status).toBe(401);
  });
  it("enquiries GET -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await listEnquiries(get("/api/admin/enquiries"))).status).toBe(401);
  });
  it("enquiries/[id] PATCH -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/enquiries/1", "http://localhost:3000"), {
      method: "PATCH",
      body: JSON.stringify({ status: "closed" }),
    });
    expect((await patchEnquiry(r, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
