import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware, _resetMaintenanceCache } from "../../middleware";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "test-jwt-secret-for-testing-only-12345678901234567890";

function makeRequest(path: string, options: Record<string, any> = {}): NextRequest {
  const url = new URL(path, "http://localhost:3000");
  const req = new NextRequest(url, {
    method: options.method || "GET",
    headers: new Headers(options.headers || {}),
    ...options,
  });
  if (options.cookie) {
    req.cookies.set("admin_token", options.cookie);
  }
  return req;
}

describe("middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
    _resetMaintenanceCache();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ enabled: false, eta: null }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("CORS preflight", () => {
    it("returns 204 for OPTIONS on /api/", async () => {
      const req = makeRequest("/api/products", { method: "OPTIONS", headers: { origin: "http://localhost:3000" } });
      const res = await middleware(req);
      expect(res.status).toBe(204);
    });

    it("sets CORS headers for allowed origin", async () => {
      const req = makeRequest("/api/products", { method: "OPTIONS", headers: { origin: "http://localhost:3000" } });
      const res = await middleware(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
      expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });

    it("does not set origin for disallowed origin", async () => {
      const req = makeRequest("/api/products", { method: "OPTIONS", headers: { origin: "https://evil.com" } });
      const res = await middleware(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });
  });

  describe("blocked registration endpoints", () => {
    it("returns 404 for /api/auth/admin-register", async () => {
      const req = makeRequest("/api/auth/admin-register");
      const res = await middleware(req);
      expect(res.status).toBe(404);
    });

    it("returns 404 for /api/auth/signup", async () => {
      const req = makeRequest("/api/auth/signup");
      const res = await middleware(req);
      expect(res.status).toBe(404);
    });

    it("returns 404 for /api/auth/register", async () => {
      const req = makeRequest("/api/auth/register");
      const res = await middleware(req);
      expect(res.status).toBe(404);
    });
  });

  describe("admin API routes", () => {
    it("returns 401 for /api/admin/ without token", async () => {
      const req = makeRequest("/api/admin/products");
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it("returns 401 for invalid token", async () => {
      const req = makeRequest("/api/admin/products", { cookie: "invalid-token" });
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it("allows valid token for /api/admin/", async () => {
      const token = jwt.sign({ username: "admin" }, SECRET, {
        issuer: "shreegurudevplastics.com",
        audience: "shreegurudevplastics-admin",
      });
      const req = makeRequest("/api/admin/products", { cookie: token });
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe("public API passthrough", () => {
    it("passes through /api/products", async () => {
      const req = makeRequest("/api/products");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes through /api/auth/login", async () => {
      const req = makeRequest("/api/auth/login");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes through /api/orders", async () => {
      const req = makeRequest("/api/orders");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe("admin pages", () => {
    it("redirects to /admin/login when no token", async () => {
      const req = makeRequest("/admin/dashboard");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin/login");
    });

    it("redirects to /admin/login for invalid token", async () => {
      const req = makeRequest("/admin/dashboard", { cookie: "bad-token" });
      const res = await middleware(req);
      expect(res.status).toBe(307);
    });

    it("allows valid token for admin pages", async () => {
      const token = jwt.sign({ username: "admin" }, SECRET, {
        issuer: "shreegurudevplastics.com",
        audience: "shreegurudevplastics-admin",
      });
      const req = makeRequest("/admin/dashboard", { cookie: token });
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes /admin/login without token", async () => {
      const req = makeRequest("/admin/login");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe("maintenance mode", () => {
    it("redirects to /maintenance when maintenance is ON", async () => {
      _resetMaintenanceCache();
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: true, eta: null }),
      }));
      const req = makeRequest("/products");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/maintenance");
    });

    it("does not redirect admin pages during maintenance", async () => {
      _resetMaintenanceCache();
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: true, eta: null }),
      }));
      const token = jwt.sign({ username: "admin" }, SECRET, {
        issuer: "shreegurudevplastics.com",
        audience: "shreegurudevplastics-admin",
      });
      const req = makeRequest("/admin/dashboard", { cookie: token });
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("does not redirect /api/maintenance during maintenance", async () => {
      _resetMaintenanceCache();
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: true, eta: null }),
      }));
      const req = makeRequest("/api/maintenance");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes through when maintenance is OFF", async () => {
      _resetMaintenanceCache();
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enabled: false, eta: null }),
      }));
      const req = makeRequest("/products");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });
});
