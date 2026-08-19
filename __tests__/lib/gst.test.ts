import { describe, it, expect } from "vitest";
import {
  calculateLineItemGST,
  calculateInvoiceGST,
  generateInvoiceNumber,
  getHSNCode,
  HSN_CODES,
} from "@/lib/gst";

describe("gst", () => {
  describe("calculateLineItemGST", () => {
    it("calculates GST for a line item", () => {
      const item = {
        productName: "Chair",
        hsnCode: "9401",
        quantity: 10,
        unitPrice: 100,
        gstRate: 18,
      };
      const result = calculateLineItemGST(item);
      expect(result.total).toBe(1000);
      expect(result.igst).toBe(180);
      expect(result.cgst).toBe(90);
      expect(result.sgst).toBe(90);
    });

    it("handles zero quantity", () => {
      const item = { productName: "X", hsnCode: "9401", quantity: 0, unitPrice: 100, gstRate: 18 };
      expect(calculateLineItemGST(item).total).toBe(0);
    });

    it("handles 12% GST rate", () => {
      const item = { productName: "X", hsnCode: "3924", quantity: 5, unitPrice: 200, gstRate: 12 };
      const result = calculateLineItemGST(item);
      expect(result.total).toBe(1000);
      expect(result.igst).toBe(120);
    });
  });

  describe("calculateInvoiceGST", () => {
    it("calculates intra-state (CGST + SGST)", () => {
      const items = [
        { productName: "Chair", hsnCode: "9401", quantity: 10, unitPrice: 100, gstRate: 18 },
      ];
      const result = calculateInvoiceGST(items, "Maharashtra");
      expect(result.subtotal).toBe(1000);
      expect(result.cgst).toBe(90);
      expect(result.sgst).toBe(90);
      expect(result.igst).toBe(0);
      expect(result.total).toBe(1180);
    });

    it("calculates inter-state (IGST)", () => {
      const items = [
        { productName: "Chair", hsnCode: "9401", quantity: 10, unitPrice: 100, gstRate: 18 },
      ];
      const result = calculateInvoiceGST(items, "Gujarat");
      expect(result.igst).toBe(180);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
    });

    it("handles multiple items with different GST rates", () => {
      const items = [
        { productName: "Chair", hsnCode: "9401", quantity: 10, unitPrice: 100, gstRate: 18 },
        { productName: "Bucket", hsnCode: "3924", quantity: 20, unitPrice: 50, gstRate: 12 },
      ];
      const result = calculateInvoiceGST(items, "Maharashtra");
      expect(result.subtotal).toBe(2000);
      expect(result.total).toBeGreaterThan(2000);
    });
  });

  describe("generateInvoiceNumber", () => {
    it("generates correct format SGP/YYMM/NNNN", () => {
      const num = generateInvoiceNumber(1);
      expect(num).toMatch(/^SGP\/\d{4}\/\d{4}$/);
    });

    it("pads id with zeros", () => {
      const num = generateInvoiceNumber(42);
      expect(num).toContain("0042");
    });
  });

  describe("getHSNCode", () => {
    it("returns correct HSN for chairs", () => {
      expect(getHSNCode("chairs")).toBe("9401");
    });

    it("returns correct HSN for tables", () => {
      expect(getHSNCode("tables")).toBe("9403");
    });

    it("returns default for unknown category", () => {
      expect(getHSNCode("unknown")).toBe("3924");
    });

    it("is case-insensitive", () => {
      expect(getHSNCode("Chairs")).toBe("9401");
    });
  });

  describe("HSN_CODES", () => {
    it("has all expected categories", () => {
      expect(Object.keys(HSN_CODES)).toContain("chairs");
      expect(Object.keys(HSN_CODES)).toContain("tables");
      expect(Object.keys(HSN_CODES)).toContain("buckets");
    });
  });
});
