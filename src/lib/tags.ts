export const AVAILABLE_TAGS = [
  { id: "best-seller", label: "Best Seller", color: "bg-yellow-500" },
  { id: "new-arrival", label: "New Arrival", color: "bg-blue-500" },
  { id: "sale", label: "Sale", color: "bg-red-500" },
  { id: "bulk-discount", label: "Bulk Discount", color: "bg-green-500" },
  { id: "limited-stock", label: "Limited Stock", color: "bg-purple-500" },
] as const;

export type TagId = (typeof AVAILABLE_TAGS)[number]["id"];

export function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString.split(",").map((t) => t.trim()).filter(Boolean);
}

export function getTagInfo(tagId: string) {
  return AVAILABLE_TAGS.find((t) => t.id === tagId);
}
