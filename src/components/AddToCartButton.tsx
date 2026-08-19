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
};

export default function AddToCartButton({ id, name, color, size, price, imageUrl, brand }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();

  const handleAdd = () => {
    addItem({ id, name, color, size, price, imageUrl, brand });
    openCart();
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-3 block w-full text-center bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
    >
      Add to Cart
    </button>
  );
}
