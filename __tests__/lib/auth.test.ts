import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  generateToken,
  verifyToken,
  getAdminUsername,
  getAdminPassword,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const TEST_SECRET = "test-jwt-secret-for-testing-only-12345678901234567890";

describe("auth", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    process.env.ADMIN_USERNAME = "testadmin";
    process.env.ADMIN_PASSWORD = "testpassword";
  });

  describe("getAdminUsername", () => {
    it("returns username from env", () => {
      expect(getAdminUsername()).toBe("testadmin");
    });

    it("throws if missing", () => {
      delete process.env.ADMIN_USERNAME;
      expect(() => getAdminUsername()).toThrow("Missing ADMIN_USERNAME");
    });
  });

  describe("getAdminPassword", () => {
    it("returns password from env", () => {
      expect(getAdminPassword()).toBe("testpassword");
    });

    it("throws if missing", () => {
      delete process.env.ADMIN_PASSWORD;
      expect(() => getAdminPassword()).toThrow("Missing ADMIN_PASSWORD");
    });
  });

  describe("hashPassword", () => {
    it("returns a bcrypt hash", async () => {
      const hash = await hashPassword("mypassword");
      expect(hash).not.toBe("mypassword");
      expect(hash.length).toBeGreaterThan(20);
      expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix
    });

    it("produces different hashes for same input (salt)", async () => {
      const hash1 = await hashPassword("mypassword");
      const hash2 = await hashPassword("mypassword");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("verifies correct password with pepper", async () => {
      const hash = await hashPassword("mypassword");
      expect(await verifyPassword("mypassword", hash)).toBe(true);
    });

    it("rejects wrong password", async () => {
      const hash = await hashPassword("mypassword");
      expect(await verifyPassword("wrongpassword", hash)).toBe(false);
    });

    it("rejects password without pepper match", async () => {
      const hash = await hashPassword("mypassword");
      expect(await verifyPassword("mypassword", hash)).toBe(true);
      expect(await verifyPassword("mypassword", hash)).not.toBe(false);
    });
  });

  describe("generateToken / verifyToken", () => {
    it("generates and verifies a token", () => {
      const token = generateToken("admin");
      expect(typeof token).toBe("string");
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.username).toBe("admin");
    });

    it("includes issuer and audience", () => {
      const token = generateToken("admin");
      const decoded = jwt.decode(token) as any;
      expect(decoded.iss).toBe("shreegurudevplastics.com");
      expect(decoded.aud).toBe("shreegurudevplastics-admin");
    });

    it("returns null for invalid token", () => {
      expect(verifyToken("invalid-token")).toBeNull();
    });

    it("returns null for token with wrong secret", () => {
      const token = jwt.sign({ username: "admin" }, "wrong-secret");
      expect(verifyToken(token)).toBeNull();
    });

    it("returns null for expired token", () => {
      const token = jwt.sign({ username: "admin" }, TEST_SECRET, {
        expiresIn: "0s",
        issuer: "shreegurudevplastics.com",
        audience: "shreegurudevplastics-admin",
      });
      expect(verifyToken(token)).toBeNull();
    });
  });

  describe("getAuthUser", () => {
    it("throws if JWT_SECRET missing", () => {
      delete process.env.JWT_SECRET;
      expect(() => generateToken("admin")).toThrow("Missing JWT_SECRET");
    });
  });
});
