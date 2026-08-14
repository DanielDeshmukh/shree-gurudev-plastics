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
  moq?: number;
};

export default function AddToCartButton({ id, name, color, size, price, imageUrl, brand, moq }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();

  const handleAdd = () => {
    addItem({ id, name, color, size, price, imageUrl, brand, moq: moq || 1 });
    openCart();
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-3 block w-full text-center bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
    >
      Add to Cart
    </button>
  );
}
