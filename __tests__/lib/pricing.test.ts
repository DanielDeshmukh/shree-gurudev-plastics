import { describe, it, expect } from "vitest";
import {
  getTierForQuantity,
  getTierPrice,
  getTierDiscount,
  getNextTier,
  TIER_THRESHOLDS,
  TIER_LABELS,
  TIER_DESCRIPTIONS,
} from "@/lib/pricing";

describe("pricing", () => {
  describe("getTierForQuantity", () => {
    it("returns individual for < 10", () => {
      expect(getTierForQuantity(1)).toBe("individual");
      expect(getTierForQuantity(5)).toBe("individual");
      expect(getTierForQuantity(9)).toBe("individual");
    });

    it("returns retailer for 10-99", () => {
      expect(getTierForQuantity(10)).toBe("retailer");
      expect(getTierForQuantity(50)).toBe("retailer");
      expect(getTierForQuantity(99)).toBe("retailer");
    });

    it("returns bulk for 100+", () => {
      expect(getTierForQuantity(100)).toBe("bulk");
      expect(getTierForQuantity(250)).toBe("bulk");
      expect(getTierForQuantity(1000)).toBe("bulk");
    });
  });

  describe("getTierPrice", () => {
    const product = {
      price: 1000,
      retailerPrice: 900,
      dealerPrice: 0,
      distributorPrice: 0,
      bulkPrice: 750,
    };

    it("returns 5% off for individual", () => {
      expect(getTierPrice(product, "individual")).toBe(950);
    });

    it("returns retailer price (10% off)", () => {
      expect(getTierPrice(product, "retailer")).toBe(900);
    });

    it("returns bulk price (25% off)", () => {
      expect(getTierPrice(product, "bulk")).toBe(750);
    });

    it("falls back to calculated price when retailer price is 0", () => {
      const p = { ...product, retailerPrice: 0 };
      expect(getTierPrice(p, "retailer")).toBe(900);
    });

    it("falls back to calculated price when bulk price is 0", () => {
      const p = { ...product, bulkPrice: 0 };
      expect(getTierPrice(p, "bulk")).toBe(750);
    });

    it("returns 0 for zero price product", () => {
      const p = { ...product, price: 0 };
      expect(getTierPrice(p, "individual")).toBe(0);
    });
  });

  describe("getTierDiscount", () => {
    it("calculates discount percentage", () => {
      const p = { price: 1000 };
      expect(getTierDiscount(p, 950)).toBe(5);
      expect(getTierDiscount(p, 900)).toBe(10);
      expect(getTierDiscount(p, 750)).toBe(25);
    });

    it("returns 0 for zero price", () => {
      expect(getTierDiscount({ price: 0 }, 0)).toBe(0);
    });
  });

  describe("getNextTier", () => {
    it("returns retailer as next from individual", () => {
      const next = getNextTier("individual");
      expect(next?.tier).toBe("retailer");
      expect(next?.minQty).toBe(10);
    });

    it("returns bulk as next from retailer", () => {
      const next = getNextTier("retailer");
      expect(next?.tier).toBe("bulk");
      expect(next?.minQty).toBe(100);
    });

    it("returns null for bulk (highest tier)", () => {
      expect(getNextTier("bulk")).toBeNull();
    });
  });

  describe("constants", () => {
    it("has correct tier labels", () => {
      expect(TIER_LABELS.individual).toBe("Individual");
      expect(TIER_LABELS.retailer).toBe("Retailer");
      expect(TIER_LABELS.bulk).toBe("Bulk Buyer");
    });

    it("has 3 tier descriptions", () => {
      expect(Object.keys(TIER_DESCRIPTIONS)).toHaveLength(3);
    });

    it("thresholds are in ascending order", () => {
      for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
        expect(TIER_THRESHOLDS[i].minQty).toBeGreaterThanOrEqual(
          TIER_THRESHOLDS[i - 1].minQty
        );
      }
    });
  });
});
