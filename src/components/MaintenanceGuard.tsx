"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const EXEMPT_PREFIXES = ["/admin", "/api", "/maintenance", "/_next"];

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isExempt = EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
    if (isExempt) {
      setChecking(false);
      return;
    }

    fetch("/api/maintenance/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled) {
          const eta = data.eta ? `?eta=${encodeURIComponent(data.eta)}` : "";
          window.location.href = `/maintenance${eta}`;
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
