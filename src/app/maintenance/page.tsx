"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MdRefresh } from "react-icons/md";

interface MaintenanceInfo {
  enabled: boolean;
  eta: string | null;
}

function useCountdown(eta: string | null) {
  const [remaining, setRemaining] = useState<{ h: number; m: number; s: number; expired: boolean }>({
    h: 0, m: 0, s: 0, expired: false,
  });

  useEffect(() => {
    if (!eta) {
      setRemaining({ h: 0, m: 0, s: 0, expired: false });
      return;
    }

    const calc = () => {
      const diff = new Date(eta).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ h: 0, m: 0, s: 0, expired: true });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s, expired: false });
    };

    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [eta]);

  return remaining;
}

export default function MaintenancePage() {
  const [info, setInfo] = useState<MaintenanceInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const countdown = useCountdown(info?.eta ?? null);

  useEffect(() => {
    fetch("/api/maintenance")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo({ enabled: true, eta: null }));
  }, []);

  useEffect(() => {
    if (countdown.expired) window.location.reload();
  }, [countdown.expired]);

  const handleRetry = () => {
    setChecking(true);
    window.location.reload();
  };

  const hasEta = info?.eta && !countdown.expired;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #F59E0B 0%, #F97316 40%, #FB923C 60%, #FBBF24 100%)",
      }}
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-20 right-20 w-16 h-16 bg-blue-400/20 rounded-2xl rotate-12 hidden md:block" />
      <div className="absolute bottom-32 left-16 w-12 h-12 bg-white/15 rounded-xl -rotate-6 hidden md:block" />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Top accent line */}
        <div className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #F97316, #FBBF24, #F97316)" }}
        />

        <div className="px-8 pt-8 pb-6 text-center">
          {/* Logo */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Shree Gurudev <span className="text-primary-600">Plastics</span>
            </h2>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            We&apos;re improving your experience
          </h1>

          {/* Subtext */}
          <p className="text-gray-500 text-sm sm:text-base mb-1">
            We&apos;ll be back up and running again shortly.
          </p>
          <p className="text-gray-400 text-xs sm:text-sm">
            Please check our WhatsApp for the latest updates.
          </p>

          {/* Countdown / Status */}
          <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
            {hasEta ? (
              <>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-3 font-medium">
                  Estimated time remaining
                </p>
                <div className="flex items-center justify-center gap-3">
                  {countdown.h > 0 && (
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-900 font-mono tabular-nums">
                        {pad(countdown.h)}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">hrs</p>
                    </div>
                  )}
                  {countdown.h > 0 && <span className="text-2xl text-gray-300 font-light mt-[-18px]">:</span>}
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-900 font-mono tabular-nums">
                      {pad(countdown.m)}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">min</p>
                  </div>
                  <span className="text-2xl text-gray-300 font-light mt-[-18px]">:</span>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-900 font-mono tabular-nums">
                      {pad(countdown.s)}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">sec</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      background: "linear-gradient(90deg, #F97316, #FBBF24)",
                      width: "60%",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2 font-medium">
                  Status
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                  </span>
                  <p className="text-base font-semibold text-gray-700">
                    We&apos;re working on it — back soon
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            disabled={checking}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            <MdRefresh className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "Check again"}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 flex items-center justify-between text-xs text-gray-400">
          <a
            href="https://wa.me/918552084251"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-500 transition-colors"
          >
            WhatsApp: +91 85520 84251
          </a>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
