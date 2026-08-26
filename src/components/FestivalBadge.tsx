"use client";

import { MdLocalFireDepartment } from "react-icons/md";

interface FestivalBadgeProps {
  discountPct?: number;
  className?: string;
}

export default function FestivalBadge({ discountPct, className = "" }: FestivalBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${className}`}>
      <MdLocalFireDepartment size={10} />
      <span>Festival{discountPct ? ` ${discountPct}% Off` : " Special"}</span>
    </div>
  );
}
