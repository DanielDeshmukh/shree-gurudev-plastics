"use client";

import { useFestivalStatus } from "@/lib/useFestivalStatus";
import type { ActiveOffer } from "@/lib/useActiveOffers";

const FESTIVAL_LABELS: Record<string, string> = {
  ganesh_chaturthi: "Ganesh Chaturthi Offer",
  diwali: "Diwali Dhamaka Offer",
  holi: "Holi Special Offer",
  navratri: "Navratri Festive Offer",
  christmas: "Christmas Special Offer",
  new_year: "New Year Mega Offer",
};

export default function FestivalOfferStrip({ offer }: { offer?: ActiveOffer | null } = {}) {
  const status = useFestivalStatus();

  if (!status?.enabled) return null;

  if (offer) {
    return (
      <div className="festival-gradient rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">{offer.title}</span>
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {offer.discountPct}% OFF
          </span>
        </div>
        {offer.deadline && (
          <span className="text-white/80 text-xs hidden sm:inline">
            Ends {new Date(offer.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    );
  }

  if (status.discountPct <= 0) return null;

  const label = FESTIVAL_LABELS[status.slug] || "Festival Offer";

  return (
    <div className="festival-gradient rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 mt-3">
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-sm">{label}</span>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {status.discountPct}% OFF
        </span>
      </div>
      <span className="text-white/80 text-xs hidden sm:inline">Limited time only!</span>
    </div>
  );
}
