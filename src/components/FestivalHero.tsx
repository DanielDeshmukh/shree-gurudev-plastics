"use client";

import Link from "next/link";
import FestivalCountdown from "./FestivalCountdown";

interface FestivalHeroProps {
  slug: string;
  bannerMessage: string;
  discountPct: number;
  endDate: string | null;
}

const FESTIVAL_MOTIFS: Record<string, { emoji: string; bg: string }> = {
  ganesh_chaturthi: { emoji: "", bg: "from-orange-500 via-amber-500 to-orange-600" },
  diwali: { emoji: "", bg: "from-amber-500 via-orange-500 to-yellow-500" },
  holi: { emoji: "", bg: "from-pink-500 via-purple-500 to-indigo-500" },
  navratri: { emoji: "", bg: "from-red-500 via-orange-500 to-yellow-500" },
  christmas: { emoji: "", bg: "from-red-500 via-green-500 to-red-600" },
  new_year: { emoji: "", bg: "from-blue-500 via-indigo-500 to-purple-500" },
};

export default function FestivalHero({ slug, bannerMessage, discountPct, endDate }: FestivalHeroProps) {
  const motif = FESTIVAL_MOTIFS[slug] || FESTIVAL_MOTIFS.ganesh_chaturthi;

  return (
    <section className={`bg-gradient-to-r ${motif.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 festival-shimmer opacity-30" />
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10 text-center text-white">
        <div className="text-4xl mb-4">{motif.emoji}</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          {bannerMessage || `${slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Special Offers!`}
        </h2>
        {discountPct > 0 && (
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Up to <span className="font-bold text-white">{discountPct}% OFF</span> on all products
          </p>
        )}
        {endDate && (
          <div className="mb-6">
            <p className="text-sm text-white/70 mb-3 uppercase tracking-wider">Offer ends in</p>
            <FestivalCountdown endDate={endDate} />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products?tag=festival"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Shop Festival Collection
          </Link>
          <a
            href={`https://wa.me/918552084251?text=${encodeURIComponent("Namaste! I am interested in Ganesh Chaturthi festival offers. Kindly share the details.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
          >
            Get Bulk Quote
          </a>
        </div>
      </div>
    </section>
  );
}
