"use client";

import { useState, useEffect, use } from "react";
import OfferForm from "@/components/OfferForm";

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/offers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInitial({
          title: data.title || "",
          description: data.description || "",
          discountPct: data.discountPct || 10,
          deadline: data.deadline || "",
          isActive: data.isActive ?? true,
          festivalSlug: data.festivalSlug || "",
          scopeType: data.scopeType || "all",
          productIds: data.productIds || [],
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-gray-400 py-12">Loading...</div>;
  if (!initial) return <div className="text-gray-400 py-12">Offer not found</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Offer</h1>
      <OfferForm offerId={parseInt(id)} initial={initial} />
    </div>
  );
}
