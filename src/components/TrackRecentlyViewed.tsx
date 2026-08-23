"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

type TrackProps = {
  product: {
    id: number;
    slug: string;
    name: string;
    imageUrl: string;
    price: number;
    color: string;
    size: string;
    brand?: string;
  };
};

export default function TrackRecentlyViewed({ product }: TrackProps) {
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  return null;
}
