import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.string().min(1).max(200).trim(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("delivery"),
  paymentMethod: z.enum(["cod", "upi", "card", "bank_transfer", "other"]).default("cod"),
  address: z.string().max(500).trim().optional(),
  notes: z.string().max(500).trim().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10000),
  })).min(1).max(100),
}).refine(
  (data) => {
    if (data.deliveryMethod === "delivery") {
      return !!data.address && data.address.trim().length > 0;
    }
    return true;
  },
  { message: "Delivery address is required for home delivery", path: ["address"] }
);

export const createReviewSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).trim(),
  productId: z.number().int().positive(),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || "Invalid input" };
}
