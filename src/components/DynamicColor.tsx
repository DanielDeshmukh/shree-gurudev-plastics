"use client";

import { useSearchParams } from "next/navigation";

function capitalize(s: string) {
  return s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function DynamicColor({ fallback }: { fallback?: string | null }) {
  const searchParams = useSearchParams();
  const colorParam = searchParams.get("color");
  const display = colorParam ? capitalize(colorParam) : fallback;

  if (!display) return null;

  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-24">Color:</span>
      <span className="text-gray-900">{display}</span>
    </div>
  );
}
