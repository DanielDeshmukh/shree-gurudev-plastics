export type CustomerTier = "individual" | "retailer" | "bulk";

export const TIER_LABELS: Record<CustomerTier, string> = {
  individual: "Individual",
  retailer: "Retailer",
  bulk: "Bulk Buyer",
};

export const TIER_DESCRIPTIONS: Record<CustomerTier, string> = {
  individual: "5% off on MRP",
  retailer: "10% off for 10+ items",
  bulk: "25% off for 100+ items",
};

export const TIER_THRESHOLDS: { tier: CustomerTier; minQty: number }[] = [
  { tier: "individual", minQty: 0 },
  { tier: "retailer", minQty: 10 },
  { tier: "bulk", minQty: 100 },
];

export const TIER_DISCOUNTS: Record<CustomerTier, number> = {
  individual: 0.05,
  retailer: 0.10,
  bulk: 0.25,
};

export function getTierForQuantity(totalQuantity: number): CustomerTier {
  let tier: CustomerTier = "individual";
  for (const t of TIER_THRESHOLDS) {
    if (totalQuantity >= t.minQty) {
      tier = t.tier;
    }
  }
  return tier;
}

export function getTierPrice(
  product: {
    price: number;
    retailerPrice: number;
    dealerPrice: number;
    distributorPrice: number;
    bulkPrice: number;
  },
  tier: CustomerTier
): number {
  const base = product.price;
  if (base <= 0) return 0;

  if (tier === "individual") {
    return Math.round(base * 0.95);
  }

  if (tier === "bulk") {
    const raw = product.bulkPrice;
    return raw > 0 && raw < base ? raw : Math.round(base * 0.75);
  }

  const raw = product.retailerPrice;
  return raw > 0 && raw < base ? raw : Math.round(base * 0.90);
}

export function getTierDiscount(
  product: { price: number },
  tierPrice: number
): number {
  if (product.price === 0) return 0;
  return Math.round(((product.price - tierPrice) / product.price) * 100);
}

export function getNextTier(currentTier: CustomerTier): { tier: CustomerTier; minQty: number; label: string } | null {
  const idx = TIER_THRESHOLDS.findIndex((t) => t.tier === currentTier);
  if (idx < 0 || idx >= TIER_THRESHOLDS.length - 1) return null;
  const next = TIER_THRESHOLDS[idx + 1];
  return { tier: next.tier, minQty: next.minQty, label: TIER_LABELS[next.tier] };
}
