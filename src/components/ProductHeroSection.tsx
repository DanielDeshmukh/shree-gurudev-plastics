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
import { getTierPrice, getTierDiscount } from "@/lib/pricing";

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
  const [qty, setQty] = useState(1);

  const displaySrc = images[activeIdx]?.imageUrl || product.imageUrl;

  const tierProduct = useMemo(() => ({
    price: product.price,
    retailerPrice: product.retailerPrice || 0,
    dealerPrice: product.dealerPrice || 0,
    distributorPrice: product.distributorPrice || 0,
    bulkPrice: product.bulkPrice || 0,
  }), [product]);

  const allColors: { id: number; slug: string; color: string; imageUrl: string | null; isCurrent: boolean }[] = useMemo(() => {
    const current = { id: product.id, slug: product.slug, color: product.color || "", imageUrl: product.imageUrl, isCurrent: true };
    const siblings = siblingColors.map(s => ({ ...s, color: s.color || "", isCurrent: false }));
    return [current, ...siblings];
  }, [product, siblingColors]);

  const hasMultipleAngles = images.length > 1;
  const hasMultipleColors = allColors.length > 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Image gallery */}
      <div className="p-4 md:p-6">
        {/* Desktop: 3-column |angles|main|colors| */}
        <div className="hidden lg:flex gap-3 items-start">
          {/* Angle thumbnails (left) */}
          {hasMultipleAngles && (
            <div className="flex flex-col gap-2 shrink-0 h-[650px] overflow-y-auto">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeIdx === idx
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <BlurImage src={img.imageUrl} alt={`${product.name} angle ${idx + 1}`} fill className="object-contain bg-gray-50" />
                </button>
              ))}
            </div>
          )}

          {/* Main image (center) */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden flex-1 min-w-0 h-[450px]">
            {displaySrc ? (
              <BlurImage
                src={displaySrc}
                alt={`${product.name} - ${product.color || ""}`}
                fill
                className="object-contain p-4 transition-all duration-300"

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

          {/* Color variants (right) */}
          {hasMultipleColors && (
            <div className="flex flex-col gap-2.5 shrink-0 pb-1 h-[650px] overflow-y-auto">
              {allColors.map((c) => (
                <Link
                  key={c.id}
                  href={`/product/${c.slug}`}
                  className={`relative w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 transition-all ${c.isCurrent
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

        {/* Mobile: stacked */}
        <div className="lg:hidden">
          {/* Angle thumbnails horizontal */}
          {hasMultipleAngles && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeIdx === idx
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <BlurImage src={img.imageUrl} alt={`${product.name} angle ${idx + 1}`} fill className="object-contain bg-gray-50" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
            {displaySrc ? (
              <BlurImage
                src={displaySrc}
                alt={`${product.name} - ${product.color || ""}`}
                fill
                className="object-contain p-4 transition-all duration-300"

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

          {/* Color variants horizontal */}
          {hasMultipleColors && (
            <div className="flex gap-2 overflow-x-auto pt-3 mt-3">
              {allColors.map((c) => (
                <Link
                  key={c.id}
                  href={`/product/${c.slug}`}
                  className={`relative w-11 h-11 shrink-0 rounded-full overflow-hidden border-2 transition-all ${c.isCurrent
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
      </div>

      {/* Right: Product info */}
      <div className="p-4 md:p-8 flex flex-col justify-center lg:border-l border-gray-100">
        {brand && (
          <Link href={`/brand/${brand.slug}`} className="text-primary-500 text-sm font-medium hover:underline mb-2">
            {brand.name}
          </Link>
        )}
        <ProductTags tags={product.tags || ""} />
        <div className="flex items-start justify-between gap-2 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
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
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-sm w-20">Color</span>
            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full font-medium">
              {product.color}
            </span>
          </div>
        )}

        {product.category && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-sm w-20">Category</span>
            <Link href={`/products?category=${categorySlug}`} className="text-primary-500 text-sm font-medium hover:underline">{product.category}</Link>
          </div>
        )}

        {product.description && (
          <p className="text-gray-600 leading-relaxed mt-2">{product.description}</p>
        )}

        {product.price > 0 ? (
          <div className="mt-4 mb-4 space-y-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg text-gray-400 line-through">{"\u20B9"}{product.price.toLocaleString("en-IN")}</span>
              <span className="text-3xl font-bold text-primary-500">{"\u20B9"}{getTierPrice(tierProduct, "individual").toLocaleString("en-IN")}</span>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Save {getTierDiscount(tierProduct, getTierPrice(tierProduct, "individual"))}%</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-full">Retailer (10+): {"\u20B9"}{getTierPrice(tierProduct, "retailer").toLocaleString("en-IN")} <span className="text-green-600 font-medium">({getTierDiscount(tierProduct, getTierPrice(tierProduct, "retailer"))}% off)</span></span>
              <span className="bg-gray-100 px-2 py-1 rounded-full">Bulk (100+): {"\u20B9"}{getTierPrice(tierProduct, "bulk").toLocaleString("en-IN")} <span className="text-green-600 font-medium">({getTierDiscount(tierProduct, getTierPrice(tierProduct, "bulk"))}% off)</span></span>
            </div>
            <p className="text-gray-500 text-sm">Inclusive of all taxes.</p>
          </div>
        ) : (
          <p className="text-3xl font-bold text-primary-500 mt-4 mb-4">Price on request</p>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Check Delivery Availability</p>
          <PincodeCheck />
        </div>

        <div className="mb-6">
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
          retailerPrice={product.retailerPrice}
          dealerPrice={product.dealerPrice}
          distributorPrice={product.distributorPrice}
          bulkPrice={product.bulkPrice}
          imageUrl={product.imageUrl || ""}
          brand={brand?.name}
          stock={product.stock}
          qty={qty}
          setQty={setQty}
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
