"use client";

import { useState, useEffect } from "react";

export type ActiveOffer = {
  id: number;
  title: string;
  description: string | null;
  discountPct: number;
  deadline: string | null;
  festivalSlug: string | null;
  productIds: number[];
  productCount: number;
};

export function useActiveOffers(festivalSlug?: string | null) {
  const [offers, setOffers] = useState<ActiveOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (festivalSlug) params.set("festival", festivalSlug);

    fetch(`/api/offers?${params}`)
      .then((r) => r.json())
      .then((d) => setOffers(d.offers || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, [festivalSlug]);

  return { offers, loading };
}

export function getBestOffer(productId: number, offers: ActiveOffer[]): ActiveOffer | null {
  const now = Date.now();
  const applicable = offers.filter((o) => {
    if (o.productIds.length > 0 && !o.productIds.includes(productId)) return false;
    if (o.deadline && new Date(o.deadline).getTime() < now) return false;
    return true;
  });
  if (applicable.length === 0) return null;
  return applicable.reduce((best, o) => (o.discountPct > best.discountPct ? o : best));
}
