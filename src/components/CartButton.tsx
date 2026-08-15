"use client";

import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <>
      <button
        onClick={openCart}
        className="fixed top-20 right-4 z-40 bg-white shadow-lg border border-gray-200 rounded-full p-3 hover:shadow-xl transition-shadow"
        aria-label="Open cart"
      >
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>
      <CartDrawer />
    </>
  );
}
