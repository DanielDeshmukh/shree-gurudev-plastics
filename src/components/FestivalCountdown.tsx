"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  endDate: string;
  onComplete?: () => void;
}

export default function FestivalCountdown({ endDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setDone(true);
        onComplete?.();
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endDate, onComplete]);

  if (done) return null;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-3 justify-center">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg w-14 h-14 flex items-center justify-center border border-white/20">
              <span className="text-xl font-bold text-white">{String(unit.value).padStart(2, "0")}</span>
            </div>
            <span className="text-[10px] text-white/60 mt-1 block uppercase tracking-wider">{unit.label}</span>
          </div>
          {i < units.length - 1 && <span className="text-white/40 text-lg font-bold mb-4">:</span>}
        </div>
      ))}
    </div>
  );
}
