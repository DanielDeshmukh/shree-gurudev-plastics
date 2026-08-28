"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useFestivalStatus } from "@/lib/useFestivalStatus";

function getTimeLeft(endDate: string | null) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

const FESTIVAL_LABELS: Record<string, string> = {
  ganesh_chaturthi: "Ganpati Bappa Morya!",
  diwali: "Shubh Deepavali!",
  holi: "Happy Holi!",
  navratri: "Jai Mata Di!",
  christmas: "Merry Christmas!",
  new_year: "Happy New Year!",
};

export default function FestivalBar() {
  const status = useFestivalStatus();
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);

  useEffect(() => {
    const hidden = sessionStorage.getItem("festival_bar_dismissed");
    if (hidden) setDismissed(true);
  }, []);

  useEffect(() => {
    if (!status?.endDate) return;
    const tick = () => setTimeLeft(getTimeLeft(status.endDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status?.endDate]);

  useEffect(() => {
    if (status?.enabled) {
      document.documentElement.setAttribute("data-festival", status.slug);
    } else {
      document.documentElement.removeAttribute("data-festival");
    }
  }, [status?.enabled, status?.slug]);

  if (!status?.enabled || dismissed) return null;

  const label = FESTIVAL_LABELS[status.slug] || status.bannerMessage;

  return (
    <div className="festival-gradient text-white text-center py-2 px-4 text-sm relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <span className="font-bold">{label}</span>
        {status.discountPct > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
            {status.discountPct}% OFF
          </span>
        )}
        {timeLeft && (
          <span className="hidden sm:inline text-white/80 text-xs">
            Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem("festival_bar_dismissed", "1");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
        >
          <MdClose size={16} />
        </button>
      </div>
    </div>
  );
}
