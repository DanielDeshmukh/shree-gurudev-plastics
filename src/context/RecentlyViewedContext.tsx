"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type ProductItem = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  color: string;
  size: string;
  brand?: string;
};

type RecentlyViewedContextType = {
  recentlyViewed: ProductItem[];
  addRecentlyViewed: (product: ProductItem) => void;
  getRecentlyViewed: () => ProductItem[];
};

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 8;

function loadFromStorage(): ProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveToStorage(items: ProductItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<ProductItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRecentlyViewed(loadFromStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveToStorage(recentlyViewed);
  }, [recentlyViewed, mounted]);

  const addRecentlyViewed = useCallback((product: ProductItem) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      return [product, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const getRecentlyViewed = useCallback(() => {
    return recentlyViewed;
  }, [recentlyViewed]);

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed, getRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
