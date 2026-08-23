"use client";

import { useState } from "react";
import Link from "next/link";
import ColorVariantPicker from "@/components/ColorVariantPicker";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";
import PincodeCheck from "@/components/PincodeCheck";
import ProductCartSection from "@/components/ProductCartSection";
import CompareButton from "@/components/CompareButton";
import ReviewList from "@/components/ReviewList";
import TrackRecentlyViewed from "@/components/TrackRecentlyViewed";
import { parseColor, matchesProduct } from "@/lib/product-helpers";

function capitalize(s: string) {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

type ProductHeroProps = {
  product: any;
  brand: any;
  colorCount: number;
};

export default function ProductHeroSection({ product, brand, colorCount }: ProductHeroProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const categorySlug = encodeURIComponent(product.category || "");
  const displayColor = activeColor ? capitalize(activeColor) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="p-4 md:p-8">
        <ColorVariantPicker
          images={product.images || []}
          mainImage={product.imageUrl || ""}
          productName={product.name}
          onColorChange={setActiveColor}
        />
      </div>

      <div className="p-4 md:p-8 flex flex-col justify-center">
        {brand && (
          <Link href={`/brand/${brand.slug}`} className="text-primary-500 text-sm font-medium hover:underline mb-2">
            {brand.name}
          </Link>
        )}
        <ProductTags tags={product.tags || ""} />
        <div className="flex items-start justify-between gap-2 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <WishlistButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl || "",
              price: product.price,
              color: product.color || "",
              size: product.size || "",
              brand: brand?.name,
            }}
          />
        </div>

        <div className="space-y-2 mb-6">
          {displayColor && colorCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Color</span>
              <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full font-medium">
                {displayColor}
              </span>
            </div>
          )}

          {(product.height || product.width || product.depth || product.weight) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Dimensions</span>
              <span className="text-gray-900 text-sm font-medium">
                {[product.height && `H: ${product.height} cm`, product.width && `W: ${product.width} cm`, product.depth && `D: ${product.depth} cm`].filter(Boolean).join(' x ')}
                {product.weight ? ` | Weight: ${product.weight} kg` : ''}
              </span>
            </div>
          )}

          {product.category && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Category</span>
              <Link href={`/products?category=${categorySlug}`} className="text-primary-500 text-sm font-medium hover:underline">{product.category}</Link>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
        )}

        <p className="text-3xl font-bold text-primary-500 mb-2">{product.price > 0 ? `\u20B9${product.price}` : "Price on request"}</p>
        <p className="text-gray-500 text-sm mb-4">Inclusive of all taxes. Bulk pricing available.</p>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Check Delivery Availability</p>
          <PincodeCheck />
        </div>

        <div className="mb-6">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              In Stock - Ready to Ship
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Out of Stock
            </span>
          )}
        </div>

        <ProductCartSection
          id={product.id}
          name={product.name}
          color={product.color || ""}
          size={product.size || ""}
          price={product.price}
          imageUrl={product.imageUrl || ""}
          brand={brand?.name}
          stock={product.stock}
        />
        <CompareButton
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl || "",
            price: product.price,
            color: product.color || "",
            size: product.size || "",
            brand: brand?.name || "",
            stock: product.stock ?? 0,
            category: product.category || "",
          }}
        />
      </div>
    </div>
  );
}
