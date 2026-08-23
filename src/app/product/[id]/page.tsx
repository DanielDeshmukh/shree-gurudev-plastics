import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function ProductIdRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await db.product.findUnique({
      where: { id: parseInt(id) },
      select: { slug: true },
    });
    if (product?.slug) {
      redirect(`/product/${product.slug}`);
    }
  } catch {
    // fall through
  }
  redirect("/products");
}
