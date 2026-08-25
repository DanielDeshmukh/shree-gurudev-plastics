"use client";

import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";
import PincodeCheck from "@/components/PincodeCheck";
import ProductCartSection from "@/components/ProductCartSection";
import CompareButton from "@/components/CompareButton";
import ShareButton from "@/components/ShareButton";
import { useState, useMemo } from "react";

type SiblingColor = {
  id: number;
  slug: string;
  color: string | null;
  imageUrl: string | null;
};

type ProductHeroProps = {
  product: any;
  brand: any;
  colorCount: number;
  siblingColors: SiblingColor[];
};

function capitalize(s: string) {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ProductHeroSection({ product, brand, colorCount, siblingColors }: ProductHeroProps) {
  const categorySlug = encodeURIComponent(product.category || "");
  const images = product.images || [];
  const [activeIdx, setActiveIdx] = useState(0);

  const displaySrc = images[activeIdx]?.imageUrl || product.imageUrl;

  const allColors: { id: number; slug: string; color: string; imageUrl: string | null; isCurrent: boolean }[] = useMemo(() => {
    const current = { id: product.id, slug: product.slug, color: product.color || "", imageUrl: product.imageUrl, isCurrent: true };
    const siblings = siblingColors.map(s => ({ ...s, color: s.color || "", isCurrent: false }));
    return [current, ...siblings];
  }, [product, siblingColors]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Image + thumbnails */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {displaySrc ? (
            <BlurImage
              src={displaySrc}
              alt={`${product.name} - ${product.color || ""}`}
              fill
              className="object-contain p-4 transition-all duration-300"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}
          {product.color && (
            <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
              {capitalize(product.color)}
            </span>
          )}
        </div>

        {/* Angle thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4">
            {images.map((img: any, idx: number) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  activeIdx === idx
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <BlurImage src={img.imageUrl} alt={`${product.name} angle ${idx + 1}`} fill className="object-contain bg-gray-50" />
              </button>
            ))}
          </div>
        )}

        {/* Color variant thumbnails */}
        {allColors.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {allColors.map((c) => (
              <Link
                key={c.id}
                href={`/product/${c.slug}`}
                className={`relative w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 transition-all ${
                  c.isCurrent
                    ? "border-primary-500 ring-2 ring-primary-200 shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                title={c.color || "View"}
              >
                {c.imageUrl ? (
                  <BlurImage src={c.imageUrl} alt={c.color || ""} fill className="object-contain bg-gray-50" />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product info */}
      <div className="space-y-4">
        {brand && (
          <Link href={`/brand/${brand.slug}`} className="text-primary-500 text-sm font-medium hover:underline">
            {brand.name}
          </Link>
        )}
        <ProductTags tags={product.tags || ""} />
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-3 shrink-0">
            <ShareButton
              product={{
                name: product.name,
                slug: product.slug,
                price: product.price,
                color: product.color || undefined,
                brand: brand?.name,
                imageUrl: product.imageUrl || undefined,
              }}
            />
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
        </div>

        {product.color && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Color</span>
            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full font-medium">
              {product.color}
            </span>
          </div>
        )}

        {product.category && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Category</span>
            <Link href={`/products?category=${categorySlug}`} className="text-primary-500 text-sm font-medium hover:underline">{product.category}</Link>
          </div>
        )}

        {product.description && (
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        )}

        <p className="text-4xl font-bold text-primary-500">{product.price > 0 ? `\u20B9${product.price}` : "Price on request"}</p>
        <p className="text-gray-500 text-sm">Inclusive of all taxes. Bulk pricing available.</p>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Check Delivery Availability</p>
          <PincodeCheck />
        </div>

        <div className="mt-6">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {product.stock} units in stock
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
