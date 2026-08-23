"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

export type CompareItem = {
  id: number;
  slug: string;
  name: string;
  color: string;
  size: string;
  price: number;
  imageUrl: string;
  brand?: string;
  stock: number;
  category: string;
};

type CompareContextType = {
  items: CompareItem[];
  toggleCompare: (item: CompareItem) => void;
  removeCompare: (id: number) => void;
  clearCompare: () => void;
  isComparing: (id: number) => boolean;
  compareCount: number;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  const toggleCompare = useCallback((item: CompareItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 products at a time.");
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeCompare = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setItems([]);
  }, []);

  const isComparing = useCallback((id: number) => items.some((i) => i.id === id), [items]);

  const compareCount = useMemo(() => items.length, [items]);

  return (
    <CompareContext.Provider value={{ items, toggleCompare, removeCompare, clearCompare, isComparing, compareCount }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
