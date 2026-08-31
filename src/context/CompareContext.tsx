"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import { useToast } from "@/components/Toast";

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

const STORAGE_KEY = "sgp_compare";

function loadFromStorage(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>(loadFromStorage);
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed = JSON.parse(e.newValue || "[]");
        if (Array.isArray(parsed)) setItems(parsed.slice(0, 4));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleCompare = useCallback((item: CompareItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      if (prev.length >= 4) {
        toast("You can compare up to 4 products at a time.", "error");
        return prev;
      }
      return [...prev, item];
    });
  }, [toast]);

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
