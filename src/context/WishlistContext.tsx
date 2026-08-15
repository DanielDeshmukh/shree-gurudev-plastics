"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";

export type WishlistItem = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  color: string;
  size: string;
  brand?: string;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (product: WishlistItem) => void;
  getWishlist: () => WishlistItem[];
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, mounted]);

  const addToWishlist = useCallback((product: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: number) => {
      return wishlist.some((item) => item.id === id);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product: WishlistItem) => {
      setWishlist((prev) => {
        const exists = prev.find((item) => item.id === product.id);
        if (exists) {
          return prev.filter((item) => item.id !== product.id);
        }
        return [...prev, product];
      });
    },
    []
  );

  const getWishlist = useCallback(() => wishlist, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      getWishlist,
      clearWishlist,
    }),
    [wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, getWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
