"use client";

import { useFestivalStatus } from "@/lib/useFestivalStatus";

const FESTIVAL_NAMES: Record<string, string> = {
  ganesh_chaturthi: "Ganpati Special",
  diwali: "Diwali Special",
  holi: "Holi Special",
  navratri: "Navratri Special",
  christmas: "Christmas Special",
  new_year: "New Year Special",
};

export default function FestivalBadge({ discountPct, title }: { discountPct?: number; title?: string } = {}) {
  const status = useFestivalStatus();

  if (!status?.enabled) return null;

  const label = title || FESTIVAL_NAMES[status.slug] || "Festival Special";
  const discount = discountPct ?? status.discountPct;

  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
      <span className="festival-gradient text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
        {label}
      </span>
      {discount > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
          {discount}% OFF
        </span>
      )}
    </div>
  );
}
