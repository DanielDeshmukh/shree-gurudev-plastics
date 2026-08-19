import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  createReviewSchema,
  loginSchema,
  validate,
} from "@/lib/validation";

describe("validation", () => {
  describe("createOrderSchema", () => {
    it("accepts valid order", () => {
      const data = {
        customer: "Test User",
        phone: "9123456789",
        address: "123 Main St",
        notes: "Urgent",
        items: [{ productId: 1, quantity: 5 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(true);
    });

    it("accepts order without optional fields", () => {
      const data = {
        customer: "Test User",
        phone: "9123456789",
        items: [{ productId: 1, quantity: 1 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(true);
    });

    it("rejects empty customer", () => {
      const data = {
        customer: "",
        phone: "9123456789",
        items: [{ productId: 1, quantity: 1 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects invalid phone (not 10 digits)", () => {
      const data = {
        customer: "Test",
        phone: "12345",
        items: [{ productId: 1, quantity: 1 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects phone with letters", () => {
      const data = {
        customer: "Test",
        phone: "abcdefghij",
        items: [{ productId: 1, quantity: 1 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects empty items array", () => {
      const data = {
        customer: "Test",
        phone: "9123456789",
        items: [],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects negative productId", () => {
      const data = {
        customer: "Test",
        phone: "9123456789",
        items: [{ productId: -1, quantity: 1 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects quantity < 1", () => {
      const data = {
        customer: "Test",
        phone: "9123456789",
        items: [{ productId: 1, quantity: 0 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects quantity > 10000", () => {
      const data = {
        customer: "Test",
        phone: "9123456789",
        items: [{ productId: 1, quantity: 10001 }],
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });

    it("rejects > 100 items", () => {
      const data = {
        customer: "Test",
        phone: "9123456789",
        items: Array.from({ length: 101 }, (_, i) => ({ productId: i + 1, quantity: 1 })),
      };
      expect(createOrderSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("createReviewSchema", () => {
    it("accepts valid review", () => {
      const data = {
        name: "John",
        rating: 5,
        comment: "Great product, love it!",
        productId: 1,
      };
      expect(createReviewSchema.safeParse(data).success).toBe(true);
    });

    it("rejects empty name", () => {
      const data = { name: "", rating: 5, comment: "Great product!", productId: 1 };
      expect(createReviewSchema.safeParse(data).success).toBe(false);
    });

    it("rejects rating < 1", () => {
      const data = { name: "John", rating: 0, comment: "Great product!", productId: 1 };
      expect(createReviewSchema.safeParse(data).success).toBe(false);
    });

    it("rejects rating > 5", () => {
      const data = { name: "John", rating: 6, comment: "Great product!", productId: 1 };
      expect(createReviewSchema.safeParse(data).success).toBe(false);
    });

    it("rejects comment < 10 chars", () => {
      const data = { name: "John", rating: 5, comment: "Short", productId: 1 };
      expect(createReviewSchema.safeParse(data).success).toBe(false);
    });

    it("rejects comment > 1000 chars", () => {
      const data = { name: "John", rating: 5, comment: "x".repeat(1001), productId: 1 };
      expect(createReviewSchema.safeParse(data).success).toBe(false);
    });

    it("rejects negative productId", () => {
      const data = { name: "John", rating: 5, comment: "Great product!", productId: -1 };
      expect(createReviewSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login", () => {
      const data = { username: "admin", password: "pass123" };
      expect(loginSchema.safeParse(data).success).toBe(true);
    });

    it("rejects empty username", () => {
      const data = { username: "", password: "pass" };
      expect(loginSchema.safeParse(data).success).toBe(false);
    });

    it("rejects empty password", () => {
      const data = { username: "admin", password: "" };
      expect(loginSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("validate()", () => {
    it("returns success with data on valid input", () => {
      const result = validate(loginSchema, { username: "admin", password: "pass" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe("admin");
      }
    });

    it("returns error string on invalid input", () => {
      const result = validate(loginSchema, { username: "", password: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });
});
