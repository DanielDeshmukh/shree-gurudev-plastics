import { describe, it, expect, beforeEach, vi } from "vitest";

let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  vi.resetModules();
  const mod = await import("@/lib/rate-limit");
  checkRateLimit = mod.checkRateLimit;
});

describe("rate-limit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks multiple attempts", () => {
    checkRateLimit("test-key", 5, 60_000);
    checkRateLimit("test-key", 5, 60_000);
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after max attempts", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key", 5, 60_000);
    }
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key", 5, 60_000);
    }
    vi.setSystemTime(new Date("2026-01-01T00:01:01Z"));
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("uses separate keys independently", () => {
    checkRateLimit("key-a", 5, 60_000);
    checkRateLimit("key-a", 5, 60_000);
    const result = checkRateLimit("key-b", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("returns correct resetAt", () => {
    const now = Date.now();
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.resetAt).toBe(now + 60_000);
  });
});
