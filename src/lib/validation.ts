import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.string().min(1).max(200).trim(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("delivery"),
  paymentMethod: z.enum(["cod", "online", "upi", "card", "bank_transfer", "other"]).default("cod"),
  address: z.string().max(500).trim().nullable().optional(),
  notes: z.string().max(500).trim().nullable().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10000),
    price: z.number().positive().optional(),
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

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  color: z.string().min(1).max(100),
  size: z.string().min(1).max(50),
  imageUrl: z.string().min(1).max(2000),
  brandId: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  category: z.string().max(100).optional(),
  subCategory: z.string().max(100).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  tags: z.string().max(500).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  retailerPrice: z.coerce.number().min(0).optional(),
  dealerPrice: z.coerce.number().min(0).optional(),
  distributorPrice: z.coerce.number().min(0).optional(),
  bulkPrice: z.coerce.number().min(0).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || "Invalid input" };
}
