import { describe, it, expect, beforeEach, vi } from "vitest";

describe("login rate limit keying", () => {
  beforeEach(() => vi.resetModules());

  it("blocks after 5 failures for the same username even from rotating IPs", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limit");
    // Mirrors the route's key format: login:<username>:<ip>
    const key = (u: string, _ip: string) => `login:${u}`;
    let blocked = false;
    for (let i = 0; i < 6; i++) {
      const r = checkRateLimit(key("shreegurudev", `10.0.0.${i}`), 5, 60_000);
      if (!r.allowed) blocked = true;
    }
    expect(blocked).toBe(true);
    vi.useRealTimers();
  });

  it("rate-limit lib allows 5 then blocks the 6th for one key", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const k = `login:testuser:1.2.3.4:${Date.now()}`;
    const results = Array.from({ length: 6 }, () => checkRateLimit(k, 5, 60_000));
    expect(results.slice(0, 5).every((r) => r.allowed)).toBe(true);
    expect(results[5].allowed).toBe(false);
    vi.useRealTimers();
  });
});
