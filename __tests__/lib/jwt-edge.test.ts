import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { verifyTokenEdge } from "@/lib/jwt-edge";

const SECRET = "test-jwt-secret-for-testing-only-12345678901234567890";
const sign = (payload: object, opts: jwt.SignOptions = {}) =>
  jwt.sign(payload, SECRET, {
    issuer: "shreegurudevplastics.com",
    audience: "shreegurudevplastics-admin",
    expiresIn: "1d",
    ...opts,
  });

describe("verifyTokenEdge", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  it("accepts a jsonwebtoken-signed HS256 token", async () => {
    const token = sign({ username: "admin" });
    expect(await verifyTokenEdge(token)).toEqual({ username: "admin" });
  });

  it("rejects garbage", async () => {
    expect(await verifyTokenEdge("not-a-jwt")).toBeNull();
  });

  it("rejects a token signed with the wrong secret", async () => {
    const token = jwt.sign({ username: "admin" }, "another-secret-xxxxxxxxxxxxxxxxxxxx", {
      issuer: "shreegurudevplastics.com",
      audience: "shreegurudevplastics-admin",
      expiresIn: "1d",
    });
    expect(await verifyTokenEdge(token)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = sign({ username: "admin" }, { expiresIn: "-10s" });
    expect(await verifyTokenEdge(token)).toBeNull();
  });

  it("rejects wrong issuer", async () => {
    const token = jwt.sign({ username: "admin" }, SECRET, {
      issuer: "evil.example",
      audience: "shreegurudevplastics-admin",
      expiresIn: "1d",
    });
    expect(await verifyTokenEdge(token)).toBeNull();
  });

  it("rejects tampered payload", async () => {
    const token = sign({ username: "admin" });
    const [h, , s] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ username: "hacker", iss: "shreegurudevplastics.com", aud: "shreegurudevplastics-admin", exp: 9999999999 })).toString("base64url");
    expect(await verifyTokenEdge(`${h}.${forged}.${s}`)).toBeNull();
  });
});
