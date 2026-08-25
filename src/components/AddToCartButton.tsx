"use client";

import { useCart } from "@/context/CartContext";

type AddToCartButtonProps = {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  imageUrl: string;
  brand?: string;
  stock?: number;
};

export default function AddToCartButton({ id, name, color, size, price, imageUrl, brand, stock }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const outOfStock = stock !== undefined && stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({ id, name, color, size, price, imageUrl, brand, stock });
    openCart();
  };

  return (
    <button
      onClick={handleAdd}
      disabled={outOfStock}
      className={`mt-3 block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
        outOfStock
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-primary-500 text-white hover:bg-primary-600"
      }`}
    >
      {outOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
