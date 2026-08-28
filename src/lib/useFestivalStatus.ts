"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "festival_update";

export function useFestivalStatus() {
  const [status, setStatus] = useState<{ enabled: boolean; slug: string; discountPct: number; bannerMessage: string; endDate: string | null } | null>(null);

  const fetchStatus = () => {
    fetch("/api/festival/status")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => setStatus({ enabled: false, slug: "", discountPct: 0, bannerMessage: "", endDate: null }));
  };

  useEffect(() => {
    fetchStatus();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) fetchStatus();
    };
    window.addEventListener("storage", onStorage);

    const interval = setInterval(fetchStatus, 30_000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  return status;
}
