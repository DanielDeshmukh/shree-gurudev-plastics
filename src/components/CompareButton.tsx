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
          ? "bg-primary-500 text-white border-primary-500 hover:bg-primary-600"
          : disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white text-primary-500 border-primary-300 hover:bg-primary-50"
      }`}
    >
      {active ? "Added \u2713" : "Compare"}
    </button>
  );
}
