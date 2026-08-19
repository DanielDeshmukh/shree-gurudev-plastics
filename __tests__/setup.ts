import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

process.env.JWT_SECRET = "test-jwt-secret-for-testing-only-12345678901234567890";
process.env.ADMIN_USERNAME = "testadmin";
process.env.ADMIN_PASSWORD = "testpassword";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
process.env.DATABASE_URL = "file:./test.db";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));
