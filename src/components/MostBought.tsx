"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { MdLocalFireDepartment } from "react-icons/md";

interface MostBoughtProduct {
  id: number;
  name: string;
  slug: string;
  color: string;
  size: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  brand: string | null;
  totalOrdered: number;
  orderCount: number;
}

export default function MostBought({ limit = 10, title }: { limit?: number; title?: string }) {
  const [products, setProducts] = useState<MostBoughtProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/most-bought?limit=${limit}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.mostBought || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <MdLocalFireDepartment size={22} className="text-orange-500" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title || "Most Bought"}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {products.map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              #{index + 1}
            </div>
            <div className="aspect-square bg-gray-50 p-3">
              {product.imageUrl ? (
                <BlurImage
                  src={product.imageUrl}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 truncate">{product.brand}</p>
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              {product.color && <p className="text-xs text-gray-400">{product.color}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-primary-500">
                  {product.price > 0 ? `₹${product.price.toLocaleString("en-IN")}` : "Contact"}
                </span>
                <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full font-medium">
                  {product.totalOrdered} sold
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
