"use client";

import { useCart } from "@/context/CartContext";
import { getTierForQuantity, getTierPrice } from "@/lib/pricing";

type AddToCartButtonProps = {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  mrp?: number;
  retailerPrice?: number;
  dealerPrice?: number;
  distributorPrice?: number;
  bulkPrice?: number;
  imageUrl: string;
  brand?: string;
  stock?: number;
  quantity?: number;
};

export default function AddToCartButton({ id, name, color, size, price, mrp, retailerPrice, dealerPrice, distributorPrice, bulkPrice, imageUrl, brand, stock, quantity }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const outOfStock = stock !== undefined && stock <= 0;
  const basePrice = mrp || price;
  const tier = getTierForQuantity(quantity || 10);
  const tierPrice = getTierPrice({ price: basePrice, retailerPrice: retailerPrice || 0, dealerPrice: dealerPrice || 0, distributorPrice: distributorPrice || 0, bulkPrice: bulkPrice || 0 }, tier);

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({ id, name, color, size, price: tierPrice, mrp: basePrice, retailerPrice: retailerPrice || 0, dealerPrice: dealerPrice || 0, distributorPrice: distributorPrice || 0, bulkPrice: bulkPrice || 0, imageUrl, brand, stock });
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
