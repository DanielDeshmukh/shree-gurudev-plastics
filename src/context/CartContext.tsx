"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import { getTierForQuantity, getTierPrice } from "@/lib/pricing";

const CART_STORAGE_KEY = "sgp_cart";

export type CartItem = {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  mrp: number;
  offerPrice?: number;
  retailerPrice: number;
  dealerPrice: number;
  distributorPrice: number;
  bulkPrice: number;
  imageUrl: string;
  brand?: string;
  quantity: number;
  stock?: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number, color?: string) => void;
  updateQuantity: (id: number, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  festivalDiscountPct: number;
  festivalDiscountAmount: number;
  finalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: any) =>
        item &&
        typeof item.id === "number" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

const MAX_QUANTITY = 999;

function cartKey(id: number, color: string) {
  return `${id}__${color || ""}`;
}

function recalcItemPrice(item: CartItem): CartItem {
  if (item.offerPrice) {
    return { ...item, price: item.offerPrice };
  }
  const tier = getTierForQuantity(item.quantity);
  const product = {
    price: item.mrp || item.price,
    retailerPrice: item.retailerPrice || 0,
    dealerPrice: item.dealerPrice || 0,
    distributorPrice: item.distributorPrice || 0,
    bulkPrice: item.bulkPrice || 0,
  };
  const newPrice = getTierPrice(product, tier);
  return { ...item, price: newPrice };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [festivalDiscountPct, setFestivalDiscountPct] = useState(0);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);

    const fetchDiscount = () => {
      fetch("/api/festival/status")
        .then((r) => r.json())
        .then((d) => { if (d.enabled && d.discountPct > 0) setFestivalDiscountPct(d.discountPct); else setFestivalDiscountPct(0); })
        .catch(() => {});
    };

    fetchDiscount();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "festival_update") fetchDiscount();
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const key = cartKey(product.id, product.color);
      const existing = prev.find((item) => cartKey(item.id, item.color) === key);
      const maxQty = product.stock !== undefined ? product.stock : MAX_QUANTITY;
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, maxQty);
        const updated = { ...existing, quantity: newQty, stock: product.stock };
        return prev.map((item) =>
          cartKey(item.id, item.color) === key ? recalcItemPrice(updated) : item
        );
      }
      const newItem = { ...product, quantity: 1 };
      return [...prev, recalcItemPrice(newItem)];
    });
  }, []);

  const removeItem = useCallback((id: number, color?: string) => {
    setItems((prev) => {
      if (color) return prev.filter((item) => cartKey(item.id, item.color) !== cartKey(id, color));
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number, color?: string) => {
    setItems((prev) => {
      if (quantity <= 0) {
        if (color) return prev.filter((i) => cartKey(i.id, i.color) !== cartKey(id, color));
        return prev.filter((i) => i.id !== id);
      }
      const key = color ? cartKey(id, color) : null;
      const maxQty = prev.find((i) => (key ? cartKey(i.id, i.color) === key : i.id === id))?.stock ?? MAX_QUANTITY;
      const clamped = Math.min(quantity, maxQty);
      return prev.map((i) => {
        const matches = key ? cartKey(i.id, i.color) === key : i.id === id;
        if (!matches) return i;
        return recalcItemPrice({ ...i, quantity: clamped });
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const festivalDiscountAmount = useMemo(() => Math.round(totalPrice * festivalDiscountPct / 100), [totalPrice, festivalDiscountPct]);
  const finalPrice = useMemo(() => totalPrice - festivalDiscountAmount, [totalPrice, festivalDiscountAmount]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, festivalDiscountPct, festivalDiscountAmount, finalPrice, isCartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
