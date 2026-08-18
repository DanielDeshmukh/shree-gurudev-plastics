"use client";

import { useState, useEffect, useCallback } from "react";

interface Decision {
  rel: string;
  file: string;
  currentColor: string;
  aiColor: string;
  raw: string;
  approved: boolean | null;
  base64: string;
}

export default function ReviewColorsPage() {
  const [entries, setEntries] = useState<Decision[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("pending");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const pageSize = 20;

  const loadPage = async (p: number, f?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
      if (f || filter) params.set("filter", f || filter);
      const res = await fetch(`/api/review-colors?${params}`);
      const data = await res.json();
      setEntries(data.entries);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/review-colors?filter=all&pageSize=1`);
      const data = await res.json();
      const allRes = await fetch(`/api/review-colors?filter=all&pageSize=0`);
      const allData = await allRes.json();
      const pendingRes = await fetch(`/api/review-colors?filter=pending&pageSize=0`);
      const pendingData = await pendingRes.json();
      const approvedRes = await fetch(`/api/review-colors?filter=approved&pageSize=0`);
      const approvedData = await approvedRes.json();
      const rejectedRes = await fetch(`/api/review-colors?filter=rejected&pageSize=0`);
      const rejectedData = await rejectedRes.json();
      setStats({
        total: allData.total,
        pending: pendingData.total,
        approved: approvedData.total,
        rejected: rejectedData.total,
      });
    } catch (e) {}
  };

  useEffect(() => {
    loadPage(0);
    loadStats();
  }, []);

  const handleApprove = async (rel: string, approve: boolean) => {
    try {
      await fetch("/api/review-colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rel, approved: approve }),
      });
      setEntries((prev) =>
        prev.map((e) => (e.rel === rel ? { ...e, approved: approve } : e))
      );
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        [approve ? "approved" : "rejected"]: prev[approve ? "approved" : "rejected"] + 1,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "a" || e.key === "A") {
        const focused = document.querySelector("[data-focused=true]");
        if (focused) {
          const rel = focused.getAttribute("data-rel");
          if (rel) handleApprove(rel, true);
        }
      }
      if (e.key === "d" || e.key === "D") {
        const focused = document.querySelector("[data-focused=true]");
        if (focused) {
          const rel = focused.getAttribute("data-rel");
          if (rel) handleApprove(rel, false);
        }
      }
    },
    [entries]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1013; color: #ECEDEF; font-family: 'Inter', system-ui, sans-serif; }
        ::selection { background: #7C8CFF33; }
      `}</style>

      <div style={{ padding: "16px 24px", borderBottom: "1px solid #2B2E35", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700 }}>AI Color Review</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); loadPage(0, f); }}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "1px solid",
                borderColor: filter === f ? "#7C8CFF" : "#2B2E35",
                background: filter === f ? "#7C8CFF33" : "#202329",
                color: filter === f ? "#7C8CFF" : "#8B8F99",
                cursor: "pointer",
              }}
            >
              {f} ({f === "all" ? stats.total : stats[f as keyof typeof stats]})
            </button>
          ))}
        </div>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#8B8F99" }}>
          Page {page + 1}/{Math.max(1, totalPages)}
        </span>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <button
            onClick={() => { if (page > 0) { setPage(page - 1); loadPage(page - 1); } }}
            disabled={page === 0}
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, background: "#202329", border: "1px solid #2B2E35", color: "#ECEDEF", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.35 : 1 }}
          >
            Prev
          </button>
          <button
            onClick={() => { if (page < totalPages - 1) { setPage(page + 1); loadPage(page + 1); } }}
            disabled={page >= totalPages - 1}
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, background: "#202329", border: "1px solid #2B2E35", color: "#ECEDEF", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.35 : 1 }}
          >
            Next
          </button>
        </div>
      </div>

      <div style={{ padding: 16, fontSize: 11, color: "#8B8F99", fontFamily: "JetBrains Mono, monospace" }}>
        <kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", color: "#ECEDEF" }}>A</kbd> approve &nbsp;
        <kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", color: "#ECEDEF" }}>D</kbd> reject &nbsp;
        Click a card to focus it (red border)
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8B8F99" }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8B8F99" }}>No images to review. Run auto-detect first.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, padding: "0 16px 40px" }}>
          {entries.map((entry) => {
            const currentHex = getMangoHex(entry.currentColor);
            const aiHex = getMangoHex(entry.aiColor);
            return (
              <div
                key={entry.rel}
                data-rel={entry.rel}
                data-focused="false"
                onClick={(e) => {
                  document.querySelectorAll("[data-focused=true]").forEach(el => el.setAttribute("data-focused", "false"));
                  (e.currentTarget as HTMLElement).setAttribute("data-focused", "true");
                }}
                style={{
                  border: "2px solid",
                  borderColor: entry.approved === true ? "#4ADE80" : entry.approved === false ? "#FF6B6B" : "#2B2E35",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#1B1D22",
                  cursor: "pointer",
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) => {
                  if (entry.approved === null) e.currentTarget.style.borderColor = "#7C8CFF";
                }}
                onMouseLeave={(e) => {
                  if (entry.approved === null) e.currentTarget.style.borderColor = "#2B2E35";
                }}
              >
                <div style={{ aspectRatio: "1", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {entry.base64 && (
                    <img src={entry.base64} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
                  )}
                </div>
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                    <span style={{ color: "#8B8F99" }}>From:</span>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: currentHex, border: "1px solid rgba(255,255,255,.15)" }} />
                    <span style={{ color: "#ECEDEF" }}>{entry.currentColor}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                    <span style={{ color: "#8B8F99" }}>To:</span>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: aiHex, border: "1px solid rgba(255,255,255,.15)" }} />
                    <span style={{ color: "#7C8CFF", fontWeight: 600 }}>{entry.aiColor}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#555", fontFamily: "JetBrains Mono, monospace", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.file}
                  </div>
                  {entry.approved === null && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(entry.rel, false); }}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none", background: "#FF6B6B", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(entry.rel, true); }}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none", background: "#4ADE80", color: "#000", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                      >
                        Approve
                      </button>
                    </div>
                  )}
                  {entry.approved === true && (
                    <div style={{ textAlign: "center", fontSize: 10, color: "#4ADE80", fontWeight: 600 }}>Approved</div>
                  )}
                  {entry.approved === false && (
                    <div style={{ textAlign: "center", fontSize: 10, color: "#FF6B6B", fontWeight: 600 }}>Rejected</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function getMangoHex(color: string): string {
  const map: Record<string, string> = {
    red: "#E31837", "mango-yellow": "#E8B830", orange: "#E8751C", "citrus-green": "#97A519",
    "mist-blue": "#567D91", black: "#231F20", "dark-grey": "#555555", "milky-white": "#D9D2C6",
    "brick-red": "#A13D2D", "rattan-dark-beige": "#8C7754", "sandal-yellow": "#C8A96E",
    "olive-green": "#4A6741", "light-peach": "#D5A583", "dark-blue": "#1B1464", blue: "#254B8E",
    "globus-brown": "#4B3621", cherry: "#7B1818", "sandal-wood": "#A0845B", "teak-wood": "#6B4226",
    "marble-beige": "#C8B99A", pink: "#E55B8B", purple: "#6B2FA0", "new-blue": "#2CA5E0",
    "eagle-brown": "#5C3A1E", "weather-brown": "#594525", "neo-blue": "#35A0CB",
    "flask-maroon": "#8B2232", green: "#2D8C3C", ivory: "#D4CEB5", "marble-gray": "#B0ADA6",
    "plaza-top": "#8F7B56", "forest-green": "#1E6B4A", "navy-blue": "#16213D",
    "marina-blue": "#2E8BC0", "rose-red": "#C92A42", "dark-peach": "#C07A5A",
    "siesta-brown": "#5C4827", "neo-yellow": "#E8C31A", "lush-green": "#38763B", gold: "#C6932A",
  };
  return map[color] || "#888";
}
