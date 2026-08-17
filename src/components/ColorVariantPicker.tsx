"use client";

import { useState } from "react";
import BlurImage from "@/components/BlurImage";

type ProductImage = {
  id: number;
  imageUrl: string;
  color: string | null;
  sortOrder: number;
};

export default function ColorVariantPicker({
  images,
  mainImage,
  productName,
}: {
  images: ProductImage[];
  mainImage: string;
  productName: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (images.length === 0) return null;

  const grouped: Record<string, ProductImage[]> = {};
  for (const img of images) {
    const color = img.color || "Other";
    if (!grouped[color]) grouped[color] = [];
    grouped[color].push(img);
  }

  const colors = Object.keys(grouped);
  const selectedImage =
    selectedIdx !== null ? images[selectedIdx] : null;
  const displaySrc = selectedImage?.imageUrl || mainImage;
  const displayAlt = selectedImage
    ? `${productName} - ${selectedImage.color}`
    : productName;

  const colorToIndex: Record<string, number> = {};
  for (const img of images) {
    const c = img.color || "Other";
    if (!(c in colorToIndex)) colorToIndex[c] = images.indexOf(img);
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
        <BlurImage
          src={displaySrc}
          alt={displayAlt}
          fill
          className="object-cover transition-all duration-300"
          key={displaySrc}
        />
        {selectedImage && (
          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            {selectedImage.color}
          </span>
        )}
      </div>

      {colors.length > 1 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Available Colors ({colors.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedIdx(colorToIndex[color])}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  selectedImage?.color === color
                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:text-primary-600"
                }`}
              >
                {color}
              </button>
            ))}
            {selectedImage && (
              <button
                onClick={() => setSelectedIdx(null)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Default
              </button>
            )}
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            All Images ({images.length})
          </p>
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedIdx(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIdx === idx
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <BlurImage
                  src={img.imageUrl}
                  alt={img.color || productName}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
