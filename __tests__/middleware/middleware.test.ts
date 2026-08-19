import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "../../middleware";
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
  });

  describe("CORS preflight", () => {
    it("returns 204 for OPTIONS on /api/", () => {
      const req = makeRequest("/api/products", { method: "OPTIONS", headers: { origin: "http://localhost:3000" } });
      const res = middleware(req);
      expect(res.status).toBe(204);
    });

    it("sets CORS headers for allowed origin", () => {
      const req = makeRequest("/api/products", { method: "OPTIONS", headers: { origin: "http://localhost:3000" } });
      const res = middleware(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
      expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });

    it("does not set origin for disallowed origin", () => {
      const req = makeRequest("/api/products", { method: "OPTIONS", headers: { origin: "https://evil.com" } });
      const res = middleware(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });
  });

  describe("blocked registration endpoints", () => {
    it("returns 404 for /api/auth/admin-register", () => {
      const req = makeRequest("/api/auth/admin-register");
      const res = middleware(req);
      expect(res.status).toBe(404);
    });

    it("returns 404 for /api/auth/signup", () => {
      const req = makeRequest("/api/auth/signup");
      const res = middleware(req);
      expect(res.status).toBe(404);
    });

    it("returns 404 for /api/auth/register", () => {
      const req = makeRequest("/api/auth/register");
      const res = middleware(req);
      expect(res.status).toBe(404);
    });
  });

  describe("admin API routes", () => {
    it("returns 401 for /api/admin/ without token", () => {
      const req = makeRequest("/api/admin/products");
      const res = middleware(req);
      expect(res.status).toBe(401);
    });

    it("returns 401 for invalid token", () => {
      const req = makeRequest("/api/admin/products", { cookie: "invalid-token" });
      const res = middleware(req);
      expect(res.status).toBe(401);
    });

    it("allows valid token for /api/admin/", () => {
      const token = jwt.sign({ username: "admin" }, SECRET, {
        issuer: "shreegurudevplastics.com",
        audience: "shreegurudevplastics-admin",
      });
      const req = makeRequest("/api/admin/products", { cookie: token });
      const res = middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe("public API passthrough", () => {
    it("passes through /api/products", () => {
      const req = makeRequest("/api/products");
      const res = middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes through /api/auth/login", () => {
      const req = makeRequest("/api/auth/login");
      const res = middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes through /api/orders", () => {
      const req = makeRequest("/api/orders");
      const res = middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe("admin pages", () => {
    it("redirects to /admin/login when no token", () => {
      const req = makeRequest("/admin/dashboard");
      const res = middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin/login");
    });

    it("redirects to /admin/login for invalid token", () => {
      const req = makeRequest("/admin/dashboard", { cookie: "bad-token" });
      const res = middleware(req);
      expect(res.status).toBe(307);
    });

    it("allows valid token for admin pages", () => {
      const token = jwt.sign({ username: "admin" }, SECRET, {
        issuer: "shreegurudevplastics.com",
        audience: "shreegurudevplastics-admin",
      });
      const req = makeRequest("/admin/dashboard", { cookie: token });
      const res = middleware(req);
      expect(res.status).toBe(200);
    });

    it("passes /admin/login without token", () => {
      const req = makeRequest("/admin/login");
      const res = middleware(req);
      expect(res.status).toBe(200);
    });
  });
});
