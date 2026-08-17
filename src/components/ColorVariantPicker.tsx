"use client";

import { useState, useMemo } from "react";
import BlurImage from "@/components/BlurImage";

type ProductImage = {
  id: number;
  imageUrl: string;
  color: string | null;
  sortOrder: number;
};

function parseColor(rawColor: string, productName: string): string {
  let c = rawColor || "Other";
  const prefix = productName.toLowerCase();
  if (c.toLowerCase().startsWith(prefix + " ")) {
    c = c.substring(prefix.length + 1);
  }
  c = c.replace(/\s+\d+$/, "").trim();
  return c || "Other";
}

function capitalize(s: string) {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ColorVariantPicker({
  images,
  mainImage,
  productName,
}: {
  images: ProductImage[];
  mainImage: string;
  productName: string;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [angleIdx, setAngleIdx] = useState(0);

  const colorGroups = useMemo(() => {
    const groups: Record<string, ProductImage[]> = {};
    for (const img of images) {
      const baseColor = parseColor(img.color || "", productName);
      if (!groups[baseColor]) groups[baseColor] = [];
      groups[baseColor].push(img);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return groups;
  }, [images, productName]);

  const colorNames = Object.keys(colorGroups);
  const hasVariants = colorNames.length > 1;

  const activeColor = selectedColor || colorNames[0] || null;
  const angles = activeColor ? colorGroups[activeColor] || [] : [];
  const currentImage = angles[angleIdx] || null;
  const displaySrc = currentImage?.imageUrl || mainImage;

  const thumbnailImages = hasVariants
    ? colorNames.map(c => colorGroups[c][0]).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {angles.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] shrink-0">
          {angles.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setAngleIdx(idx)}
              className={`relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                angleIdx === idx
                  ? "border-primary-500 ring-2 ring-primary-200"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <BlurImage src={img.imageUrl} alt={`${productName} angle ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden flex-1">
        <BlurImage
          src={displaySrc}
          alt={activeColor ? `${productName} - ${activeColor}` : productName}
          fill
          className="object-cover transition-all duration-300"
          key={displaySrc}
        />
        {activeColor && (
          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            {capitalize(activeColor)}
          </span>
        )}
      </div>

      <div className="flex lg:flex-col gap-3 lg:gap-4 justify-center lg:justify-start lg:pt-0 pt-2">
        {hasVariants && colorNames.map((color) => {
          const thumb = colorGroups[color][0];
          const isSelected = activeColor === color;
          return (
            <button
              key={color}
              onClick={() => { setSelectedColor(color); setAngleIdx(0); }}
              className={`relative w-14 h-14 lg:w-16 lg:h-16 shrink-0 rounded-full overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-primary-500 ring-2 ring-primary-200 shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              title={capitalize(color)}
            >
              <BlurImage src={thumb.imageUrl} alt={capitalize(color)} fill className="object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
