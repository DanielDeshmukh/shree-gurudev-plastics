"use client";

import { useCompare, CompareItem } from "@/context/CompareContext";

type CompareButtonProps = {
  product: CompareItem;
};

export default function CompareButton({ product }: CompareButtonProps) {
  const { toggleCompare, isComparing, compareCount } = useCompare();
  const active = isComparing(product.id);
  const disabled = compareCount >= 4 && !active;

  return (
    <button
      onClick={() => toggleCompare(product)}
      disabled={disabled}
      className={`mt-3 block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors border ${
        active
          ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
          : disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
      }`}
    >
      {active ? "Added \u2713" : "Compare"}
    </button>
  );
}
