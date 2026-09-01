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
    it("returns individual for small quantities", () => {
      expect(getTierForQuantity(0)).toBe("individual");
      expect(getTierForQuantity(1)).toBe("individual");
      expect(getTierForQuantity(9)).toBe("individual");
    });

    it("returns retailer for 10-49 items", () => {
      expect(getTierForQuantity(10)).toBe("retailer");
      expect(getTierForQuantity(25)).toBe("retailer");
      expect(getTierForQuantity(49)).toBe("retailer");
    });

    it("returns dealer for 50-99 items", () => {
      expect(getTierForQuantity(50)).toBe("dealer");
      expect(getTierForQuantity(75)).toBe("dealer");
      expect(getTierForQuantity(99)).toBe("dealer");
    });

    it("returns distributor for 100-499 items", () => {
      expect(getTierForQuantity(100)).toBe("distributor");
      expect(getTierForQuantity(250)).toBe("distributor");
      expect(getTierForQuantity(499)).toBe("distributor");
    });

    it("returns bulk for 500+ items", () => {
      expect(getTierForQuantity(500)).toBe("bulk");
      expect(getTierForQuantity(1000)).toBe("bulk");
    });
  });

  describe("getTierPrice", () => {
    const product = {
      price: 1000,
      retailerPrice: 900,
      dealerPrice: 800,
      distributorPrice: 700,
      bulkPrice: 600,
    };

    it("returns base price for individual", () => {
      expect(getTierPrice(product, "individual")).toBe(980);
    });

    it("returns retailer price", () => {
      expect(getTierPrice(product, "retailer")).toBe(900);
    });

    it("returns dealer price", () => {
      expect(getTierPrice(product, "dealer")).toBe(800);
    });

    it("returns distributor price", () => {
      expect(getTierPrice(product, "distributor")).toBe(700);
    });

    it("returns bulk price", () => {
      expect(getTierPrice(product, "bulk")).toBe(600);
    });

    it("falls back to base price when tier price is 0", () => {
      const p = { ...product, retailerPrice: 0 };
      expect(getTierPrice(p, "retailer")).toBe(980);
    });

    it("falls back chain for bulk", () => {
      const p = { ...product, bulkPrice: 0, distributorPrice: 0 };
      expect(getTierPrice(p, "bulk")).toBe(800);
    });
  });

  describe("getTierDiscount", () => {
    it("calculates discount percentage", () => {
      expect(getTierDiscount({ price: 1000 }, 800)).toBe(20);
    });

    it("returns 0 for zero base price", () => {
      expect(getTierDiscount({ price: 0 }, 800)).toBe(0);
    });

    it("returns 0 when no discount", () => {
      expect(getTierDiscount({ price: 1000 }, 1000)).toBe(0);
    });
  });

  describe("getNextTier", () => {
    it("returns retailer as next tier from individual", () => {
      const next = getNextTier("individual");
      expect(next?.tier).toBe("retailer");
      expect(next?.minQty).toBe(10);
    });

    it("returns dealer as next from retailer", () => {
      const next = getNextTier("retailer");
      expect(next?.tier).toBe("dealer");
      expect(next?.minQty).toBe(50);
    });

    it("returns null for bulk (highest tier)", () => {
      expect(getNextTier("bulk")).toBeNull();
    });
  });

  describe("constants", () => {
    it("has all tier labels", () => {
      expect(TIER_LABELS.individual).toBe("Individual");
      expect(TIER_LABELS.retailer).toBe("Retailer");
      expect(TIER_LABELS.dealer).toBe("Dealer");
      expect(TIER_LABELS.distributor).toBe("Distributor");
      expect(TIER_LABELS.bulk).toBe("Bulk Buyer");
    });

    it("has all tier descriptions", () => {
      expect(Object.keys(TIER_DESCRIPTIONS)).toHaveLength(5);
    });

    it("has thresholds sorted ascending", () => {
      for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
        expect(TIER_THRESHOLDS[i].minQty).toBeGreaterThanOrEqual(
          TIER_THRESHOLDS[i - 1].minQty
        );
      }
    });
  });
});
