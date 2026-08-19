import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBaseUrl, apiFetch } from "@/lib/api-fetch";

describe("api-fetch", () => {
  describe("getBaseUrl", () => {
    const originalWindow = globalThis.window;

    afterEach(() => {
      if (originalWindow !== undefined) {
        (globalThis as any).window = originalWindow;
      } else {
        delete (globalThis as any).window;
      }
    });

    it("returns empty string on client", () => {
      (globalThis as any).window = {};
      expect(getBaseUrl()).toBe("");
    });

    it("returns Vercel URL when set", () => {
      delete (globalThis as any).window;
      process.env.VERCEL_URL = "my-app.vercel.app";
      const result = getBaseUrl();
      expect(result).toBe("https://my-app.vercel.app");
      delete process.env.VERCEL_URL;
    });

    it("returns NEXT_PUBLIC_SITE_URL as fallback", () => {
      delete (globalThis as any).window;
      delete process.env.VERCEL_URL;
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
      const result = getBaseUrl();
      expect(result).toBe("https://example.com");
    });

    it("returns localhost in development", () => {
      delete (globalThis as any).window;
      delete process.env.VERCEL_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NODE_ENV = "development";
      expect(getBaseUrl()).toBe("http://localhost:3000");
    });
  });

  describe("apiFetch", () => {
    it("calls fetch with correct URL and no-store cache", async () => {
      const originalWindow = (globalThis as any).window;
      delete (globalThis as any).window;
      const fetchSpy = vi.fn().mockResolvedValue(new Response("{}"));
      globalThis.fetch = fetchSpy;
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
      delete process.env.VERCEL_URL;

      await apiFetch("/api/products");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://example.com/api/products",
        expect.objectContaining({ cache: "no-store" })
      );

      if (originalWindow !== undefined) {
        (globalThis as any).window = originalWindow;
      }
    });
  });
});
