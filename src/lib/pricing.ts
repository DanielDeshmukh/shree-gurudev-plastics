export type CustomerTier = "individual" | "retailer" | "dealer" | "distributor" | "bulk";

export const TIER_LABELS: Record<CustomerTier, string> = {
  individual: "Individual",
  retailer: "Retailer",
  dealer: "Dealer",
  distributor: "Distributor",
  bulk: "Bulk Buyer",
};

export const TIER_DESCRIPTIONS: Record<CustomerTier, string> = {
  individual: "2% off for everyone",
  retailer: "5% off for 10+ items",
  dealer: "10% off for 50+ items",
  distributor: "15% off for 100+ items",
  bulk: "20% off for 500+ items",
};

export const TIER_THRESHOLDS: { tier: CustomerTier; minQty: number }[] = [
  { tier: "individual", minQty: 0 },
  { tier: "retailer", minQty: 10 },
  { tier: "dealer", minQty: 50 },
  { tier: "distributor", minQty: 100 },
  { tier: "bulk", minQty: 500 },
];

export const TIER_DISCOUNTS: Record<CustomerTier, number> = {
  individual: 0.02,
  retailer: 0.05,
  dealer: 0.10,
  distributor: 0.15,
  bulk: 0.20,
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

  // Individual always gets 2% off MRP
  if (tier === "individual") {
    return Math.round(base * 0.98);
  }

  // For higher tiers, use DB price but never above MRP
  let raw: number;
  switch (tier) {
    case "bulk":
      raw = product.bulkPrice || product.distributorPrice || product.dealerPrice || product.retailerPrice || base;
      break;
    case "distributor":
      raw = product.distributorPrice || product.dealerPrice || product.retailerPrice || base;
      break;
    case "dealer":
      raw = product.dealerPrice || product.retailerPrice || base;
      break;
    case "retailer":
      raw = product.retailerPrice || base;
      break;
    default:
      raw = base;
  }
  // Never return a price higher than MRP, never lower than 0
  return raw > 0 && raw < base ? raw : Math.round(base * 0.98);
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
