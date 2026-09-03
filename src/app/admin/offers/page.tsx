"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdDiscount } from "react-icons/md";

type Offer = {
  id: number;
  title: string;
  description: string | null;
  discountPct: number;
  deadline: string | null;
  isActive: boolean;
  festivalSlug: string | null;
  scopeType: string;
  scopeValue: string | null;
  productCount: number;
  createdAt: string;
};

function Countdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [deadline]);

  return <span className="text-xs text-orange-400 font-medium">{timeLeft}</span>;
}

const FESTIVAL_LABELS: Record<string, string> = {
  ganesh_chaturthi: "Ganesh Chaturthi",
  diwali: "Diwali",
  holi: "Holi",
  navratri: "Navratri",
  christmas: "Christmas",
  new_year: "New Year",
  raksha_bandhan: "Raksha Bandhan",
  eid: "Eid",
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/offers");
      const data = await res.json();
      setOffers(data.offers || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const toggleOffer = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/offers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchOffers();
  };

  const deleteOffer = async (id: number) => {
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    fetchOffers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MdDiscount className="text-green-400" /> Offers
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage festival offers and discounts</p>
        </div>
        <Link
          href="/admin/offers/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <MdAdd /> New Offer
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <MdDiscount className="text-5xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No offers yet. Create your first offer!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className={`bg-gray-800 rounded-xl border p-4 ${offer.isActive ? "border-green-600/50" : "border-gray-700"}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold truncate">{offer.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${offer.isActive ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-400"}`}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                      {offer.discountPct}% OFF
                    </span>
                    {offer.festivalSlug && (
                      <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {FESTIVAL_LABELS[offer.festivalSlug] || offer.festivalSlug}
                      </span>
                    )}
                    {offer.deadline && <Countdown deadline={offer.deadline} />}
                  </div>
                  {offer.description && (
                    <p className="text-gray-400 text-sm mt-1 truncate">{offer.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{offer.productCount} products selected</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleOffer(offer.id, offer.isActive)}
                    className={`text-2xl ${offer.isActive ? "text-green-400" : "text-gray-600"}`}
                  >
                    {offer.isActive ? <MdToggleOn /> : <MdToggleOff />}
                  </button>
                  <Link
                    href={`/admin/offers/${offer.id}`}
                    className="text-blue-400 hover:text-blue-300 p-1"
                  >
                    <MdEdit size={20} />
                  </Link>
                  <button
                    onClick={() => deleteOffer(offer.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
