export type CustomerTier = "retailer" | "dealer" | "distributor" | "bulk";

export const TIER_LABELS: Record<CustomerTier, string> = {
  retailer: "Retailer",
  dealer: "Dealer",
  distributor: "Distributor",
  bulk: "Bulk Buyer",
};

export const TIER_DESCRIPTIONS: Record<CustomerTier, string> = {
  retailer: "Standard retail pricing",
  dealer: "Discounted dealer pricing",
  distributor: "Preferred distributor rates",
  bulk: "Best bulk pricing",
};

export const TIER_THRESHOLDS: { tier: CustomerTier; minOrders: number; minSpent: number }[] = [
  { tier: "retailer", minOrders: 0, minSpent: 0 },
  { tier: "dealer", minOrders: 5, minSpent: 10000 },
  { tier: "distributor", minOrders: 15, minSpent: 50000 },
  { tier: "bulk", minOrders: 30, minSpent: 150000 },
];

export function calculateTier(totalOrders: number, totalSpent: number): CustomerTier {
  let tier: CustomerTier = "retailer";
  for (const t of TIER_THRESHOLDS) {
    if (totalOrders >= t.minOrders && totalSpent >= t.minSpent) {
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
    default:
      return product.retailerPrice || product.price;
  }
}

export function getTierDiscount(
  product: { price: number },
  tierPrice: number
): number {
  if (product.price === 0) return 0;
  return Math.round(((product.price - tierPrice) / product.price) * 100);
}
