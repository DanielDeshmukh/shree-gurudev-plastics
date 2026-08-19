import { describe, it, expect } from "vitest";
import {
  calculateTier,
  getTierPrice,
  getTierDiscount,
  TIER_THRESHOLDS,
  TIER_LABELS,
  TIER_DESCRIPTIONS,
} from "@/lib/pricing";

describe("pricing", () => {
  describe("calculateTier", () => {
    it("returns retailer for new customer", () => {
      expect(calculateTier(0, 0)).toBe("retailer");
    });

    it("returns dealer when thresholds met", () => {
      expect(calculateTier(5, 10000)).toBe("dealer");
    });

    it("returns distributor when thresholds met", () => {
      expect(calculateTier(15, 50000)).toBe("distributor");
    });

    it("returns bulk when thresholds met", () => {
      expect(calculateTier(30, 150000)).toBe("bulk");
    });

    it("returns retailer when only orders met but not spent", () => {
      expect(calculateTier(5, 5000)).toBe("retailer");
    });

    it("returns highest qualifying tier", () => {
      expect(calculateTier(50, 200000)).toBe("bulk");
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
      expect(getTierPrice(p, "retailer")).toBe(1000);
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

  describe("constants", () => {
    it("has all tier labels", () => {
      expect(TIER_LABELS.retailer).toBe("Retailer");
      expect(TIER_LABELS.dealer).toBe("Dealer");
      expect(TIER_LABELS.distributor).toBe("Distributor");
      expect(TIER_LABELS.bulk).toBe("Bulk Buyer");
    });

    it("has all tier descriptions", () => {
      expect(Object.keys(TIER_DESCRIPTIONS)).toHaveLength(4);
    });

    it("has thresholds sorted ascending", () => {
      for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
        expect(TIER_THRESHOLDS[i].minOrders).toBeGreaterThanOrEqual(
          TIER_THRESHOLDS[i - 1].minOrders
        );
      }
    });
  });
});
