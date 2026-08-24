"use client";

import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";
import PincodeCheck from "@/components/PincodeCheck";
import ProductCartSection from "@/components/ProductCartSection";
import CompareButton from "@/components/CompareButton";
import ShareButton from "@/components/ShareButton";

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

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    black: "#1a1a1a", white: "#f5f5f5", red: "#dc2626", blue: "#2563eb",
    green: "#16a34a", yellow: "#eab308", orange: "#ea580c", purple: "#9333ea",
    pink: "#ec4899", grey: "#9ca3af", gray: "#9ca3af", brown: "#92400e",
    beige: "#d4b896", ivory: "#fffff0", cherry: "#9b1b30", "citrus green": "#4ade80",
    "mango yellow": "#facc15", "mango orange": "#fb923c", "marble beige": "#c8b89a",
    "marble grey": "#a3a3a3", "mystic red": "#b91c1c", "sandal wood": "#c2a87d",
    "weather brown": "#78593a", gold: "#ca8a04", "dark beige": "#b8a88a",
    "marina blue": "#3b82f6", teal: "#14b8a6", cream: "#fef3c7",
  };
  return map[color.toLowerCase()] || "#9ca3af";
}

export default function ProductHeroSection({ product, brand, colorCount, siblingColors }: ProductHeroProps) {
  const categorySlug = encodeURIComponent(product.category || "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* Image section */}
      <div className="p-4 md:p-8">
        <div className="relative bg-gray-100 rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <BlurImage
              src={product.imageUrl}
              alt={`${product.name} - ${product.color || ""}`}
              fill
              className="object-contain p-4"
              priority
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}
          {product.color && (
            <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
              {product.color}
            </span>
          )}
        </div>

        {/* Angle images */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {product.images.map((img: any) => (
              <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border-2 border-primary-500">
                <BlurImage src={img.imageUrl} alt={product.name} fill className="object-contain bg-gray-50" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-4 md:p-8 flex flex-col justify-center">
        {brand && (
          <Link href={`/brand/${brand.slug}`} className="text-primary-500 text-sm font-medium hover:underline mb-2">
            {brand.name}
          </Link>
        )}
        <ProductTags tags={product.tags || ""} />
        <div className="flex items-start justify-between gap-2 mb-4">
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

        {/* Color info */}
        <div className="space-y-2 mb-6">
          {product.color && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Color</span>
              <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full font-medium">
                {product.color}
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

        {/* Available Colors */}
        {siblingColors.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Available Colors</p>
            <div className="flex flex-wrap gap-2">
              {/* Current color */}
              <Link
                href={`/product/${product.slug}`}
                className="relative w-9 h-9 rounded-full ring-2 ring-primary-500 ring-offset-2 overflow-hidden"
                title={product.color || "Current"}
              >
                <div className="w-full h-full" style={{ backgroundColor: colorToHex(product.color || "") }} />
              </Link>
              {/* Sibling colors */}
              {siblingColors.map((s) => (
                <Link
                  key={s.id}
                  href={`/product/${s.slug}`}
                  className="relative w-9 h-9 rounded-full ring-1 ring-gray-200 hover:ring-primary-400 hover:ring-2 transition-all overflow-hidden"
                  title={s.color || "View"}
                >
                  {s.imageUrl ? (
                    <BlurImage src={s.imageUrl} alt={s.color || ""} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: colorToHex(s.color || "") }} />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

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
