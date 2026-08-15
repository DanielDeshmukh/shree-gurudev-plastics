"use client";

import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

export default function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Recently Viewed</h2>
      <p className="text-gray-600 text-center mb-8">
        Products you recently browsed. Pick up where you left off.
      </p>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {recentlyViewed.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-56 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/product/${product.id}`}>
              <div className="relative aspect-square bg-gray-100">
                {product.imageUrl ? (
                  <BlurImage src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>
            </Link>
            <div className="p-3">
              <Link href={`/product/${product.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1 text-sm">
                  {product.name}
                </h3>
              </Link>
              <p className="text-lg font-bold text-primary-500 mt-1">₹{product.price}</p>
              {product.brand && (
                <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
              )}
              <Link
                href={`/product/${product.id}`}
                className="inline-block mt-2 text-xs font-medium text-primary-500 hover:underline"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
