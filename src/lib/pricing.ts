export type CustomerTier = "individual" | "retailer" | "dealer" | "distributor" | "bulk";

export const TIER_LABELS: Record<CustomerTier, string> = {
  individual: "Individual",
  retailer: "Retailer",
  dealer: "Dealer",
  distributor: "Distributor",
  bulk: "Bulk Buyer",
};

export const TIER_DESCRIPTIONS: Record<CustomerTier, string> = {
  individual: "Standard pricing for small orders",
  retailer: "Discounted pricing for 10+ items",
  dealer: "Special pricing for 50+ items",
  distributor: "Preferred rates for 100+ items",
  bulk: "Best pricing for 500+ items",
};

export const TIER_THRESHOLDS: { tier: CustomerTier; minQty: number }[] = [
  { tier: "individual", minQty: 0 },
  { tier: "retailer", minQty: 10 },
  { tier: "dealer", minQty: 50 },
  { tier: "distributor", minQty: 100 },
  { tier: "bulk", minQty: 500 },
];

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
  switch (tier) {
    case "bulk":
      return product.bulkPrice || product.distributorPrice || product.dealerPrice || product.retailerPrice || product.price;
    case "distributor":
      return product.distributorPrice || product.dealerPrice || product.retailerPrice || product.price;
    case "dealer":
      return product.dealerPrice || product.retailerPrice || product.price;
    case "retailer":
      return product.retailerPrice || product.price;
    case "individual":
    default:
      return product.price;
  }
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
