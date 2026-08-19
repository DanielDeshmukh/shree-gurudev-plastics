import { describe, it, expect, vi, beforeEach } from "vitest";

let securityLogger: typeof import("@/lib/security-logger").securityLogger;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  const mod = await import("@/lib/security-logger");
  securityLogger = mod.securityLogger;
});

describe("security-logger", () => {
  const consoleSpy = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
  };

  it("logs login attempt success", () => {
    securityLogger.loginAttempt("admin", true, "127.0.0.1");
    const logs = securityLogger.getRecent(1);
    expect(logs.length).toBe(1);
    expect(logs[0].event).toBe("LOGIN_ATTEMPT");
    expect(logs[0].level).toBe("info");
    expect(logs[0].details).toEqual({ username: "admin", success: true });
    expect(logs[0].ip).toBe("127.0.0.1");
  });

  it("logs login attempt failure", () => {
    securityLogger.loginAttempt("admin", false, "127.0.0.1");
    const logs = securityLogger.getRecent(1);
    expect(logs[0].level).toBe("warn");
  });

  it("logs unauthorized access", () => {
    securityLogger.unauthorizedAccess("/api/admin", "10.0.0.1");
    const logs = securityLogger.getRecent(1);
    expect(logs[0].event).toBe("UNAUTHORIZED_ACCESS");
    expect(logs[0].details).toEqual({ path: "/api/admin" });
  });

  it("logs path traversal attempt", () => {
    securityLogger.pathTraversalAttempt("../../../etc/passwd", "10.0.0.1");
    const logs = securityLogger.getRecent(1);
    expect(logs[0].event).toBe("PATH_TRAVERSAL_ATTEMPT");
    expect(logs[0].level).toBe("security");
  });

  it("logs price manipulation attempt", () => {
    securityLogger.priceManipulationAttempt(42, "10.0.0.1");
    const logs = securityLogger.getRecent(1);
    expect(logs[0].event).toBe("PRICE_MANIPULATION_ATTEMPT");
    expect(logs[0].details).toEqual({ orderId: 42 });
  });

  it("logs admin action", () => {
    securityLogger.adminAction("DELETE", "product:5", "admin");
    const logs = securityLogger.getRecent(1);
    expect(logs[0].event).toBe("ADMIN_ACTION");
    expect(logs[0].level).toBe("info");
  });

  it("logs rate limit exceeded", () => {
    securityLogger.rateLimitExceeded("/api/auth/login", "10.0.0.1");
    const logs = securityLogger.getRecent(1);
    expect(logs[0].event).toBe("RATE_LIMIT_EXCEEDED");
    expect(logs[0].level).toBe("warn");
  });

  it("logs error events", () => {
    securityLogger.error("DB_CONNECTION", { host: "localhost" });
    const logs = securityLogger.getRecent(1);
    expect(logs[0].event).toBe("DB_CONNECTION");
    expect(logs[0].level).toBe("error");
  });

  it("returns correct count from getRecent", () => {
    securityLogger.loginAttempt("a", true);
    securityLogger.loginAttempt("b", true);
    securityLogger.loginAttempt("c", true);
    expect(securityLogger.getRecent(2).length).toBe(2);
    expect(securityLogger.getRecent(100).length).toBe(3);
  });

  it("has timestamp in ISO format", () => {
    securityLogger.loginAttempt("test", true);
    const logs = securityLogger.getRecent(1);
    expect(new Date(logs[0].timestamp).toISOString()).toBe(logs[0].timestamp);
  });
});
