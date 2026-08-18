"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ColorItem {
  id: number;
  imageUrl: string;
  productName: string;
  dbColor: string;
  aiColor: string | null;
  aiRaw: string | null;
  currentDecision: "approve" | "reject" | null;
}

const MANGO_COLORS: Record<string, string> = {
  red: "#E31837",
  mango_yellow: "#E8B830",
  orange: "#E8751C",
  citrus_green: "#97A519",
  mist_blue: "#567D91",
  black: "#231F20",
  dark_grey: "#555555",
  milky_white: "#D9D2C6",
  brick_red: "#A13D2D",
  rattan_dark_beige: "#8C7754",
  sandal_yellow: "#C8A96E",
  olive_green: "#4A6741",
  light_peach: "#D5A583",
  dark_blue: "#1B1464",
  blue: "#254B8E",
  globus_brown: "#4B3621",
  brown: "#6B3A2A",
  cream: "#F5E6C8",
  wine: "#722F37",
  pink: "#D4A5A5",
  parrot_green: "#4CAF50",
  parrot_blue: "#1E90FF",
  grey: "#999999",
  white: "#FFFFFF",
  beige: "#D4C5A9",
  chocolate: "#3E2723",
  caramel: "#FFD59A",
  teak: "#8B6914",
  coffee_brown: "#4E3524",
  dusty_rose: "#C9A0A0",
  olive: "#808000",
  golden_brown: "#996515",
  sea_green: "#2E8B57",
  maroon: "#800000",
  purple: "#800080",
  dark_brown: "#3E2723",
  light_brown: "#8B7355",
  sandal: "#C8A96E",
  mystic_red: "#C74832",
  siesta_brown: "#A0785A",
  black_sheep: "#2C2C2C",
  coffee: "#4E3524",
};

function getColorHex(colorName: string): string {
  if (!colorName) return "#999999";
  const normalized = colorName.toLowerCase().replace(/[\s-]/g, "_");
  if (MANGO_COLORS[normalized]) return MANGO_COLORS[normalized];
  if (colorName.startsWith("#")) return colorName;
  return "#999999";
}

export default function LabelColorsPage() {
  const [items, setItems] = useState<ColorItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ColorItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/label-colors")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setFilteredItems(data.items);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = items;
    if (filter === "pending") filtered = items.filter((i) => !i.currentDecision);
    else if (filter === "approved") filtered = items.filter((i) => i.currentDecision === "approve");
    else if (filter === "rejected") filtered = items.filter((i) => i.currentDecision === "reject");
    setFilteredItems(filtered);
    setCursor(0);
  }, [filter, items]);

  useEffect(() => {
    const approved = items.filter((i) => i.currentDecision === "approve").length;
    const rejected = items.filter((i) => i.currentDecision === "reject").length;
    setStats({ total: items.length, approved, rejected, pending: items.length - approved - rejected });
  }, [items]);

  const saveDecision = useCallback(
    async (id: number, decision: "approve" | "reject") => {
      setSaving(true);
      const item = items.find((i) => i.id === id);
      await fetch("/api/label-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: id, decision, color: item?.aiColor }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, currentDecision: decision } : i))
      );
      setSaving(false);
    },
    [items]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (filteredItems[cursor]) saveDecision(filteredItems[cursor].id, "approve");
        if (cursor < filteredItems.length - 1) setCursor((c) => c + 1);
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        if (filteredItems[cursor]) saveDecision(filteredItems[cursor].id, "reject");
        if (cursor < filteredItems.length - 1) setCursor((c) => c + 1);
      } else if (e.key === "ArrowRight" || e.key === "j") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filteredItems.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
    },
    [cursor, filteredItems, saveDecision]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gridRef.current) {
      const card = gridRef.current.children[cursor] as HTMLElement;
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [cursor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4 sticky top-0 z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-xl font-bold text-gray-900">Color Labeler</h1>
            <div className="flex gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    filter === f
                      ? f === "approved"
                        ? "bg-green-600 text-white"
                        : f === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-mono">{cursor + 1}</span> / {filteredItems.length}
              {" | "}
              <span className="text-green-600">{stats.approved} approved</span>
              {" | "}
              <span className="text-red-600">{stats.rejected} rejected</span>
              {" | "}
              <span className="text-gray-500">{stats.pending} pending</span>
              {saving && <span className="ml-2 text-blue-500">Saving...</span>}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">A</kbd> Approve &nbsp;
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">D</kbd> Reject &nbsp;
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">←→</kbd> Navigate
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg overflow-hidden shadow-sm border-2 transition-all ${
                idx === cursor
                  ? "border-blue-500 ring-2 ring-blue-300"
                  : item.currentDecision === "approve"
                  ? "border-green-400"
                  : item.currentDecision === "reject"
                  ? "border-red-400"
                  : "border-transparent"
              }`}
            >
              <div className="aspect-square bg-gray-50 relative">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                {item.currentDecision && (
                  <div
                    className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                      item.currentDecision === "approve" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {item.currentDecision === "approve" ? "APPROVED" : "REJECTED"}
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1.5">
                <div className="text-[11px] text-gray-500 truncate" title={item.productName}>
                  {item.productName}
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-gray-500">From:</span>
                  <span
                    className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                    style={{ backgroundColor: getColorHex(item.dbColor) }}
                  />
                  <span className="font-medium text-gray-700 truncate">{item.dbColor}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-gray-500">To:</span>
                  <span
                    className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                    style={{ backgroundColor: getColorHex(item.aiColor || "") }}
                  />
                  <span className="font-medium text-gray-700 truncate">{item.aiColor || "N/A"}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => saveDecision(item.id, "reject")}
                    className="flex-1 py-1 bg-red-500 text-white text-[11px] font-semibold rounded hover:bg-red-600 transition-colors"
                  >
                    D: Reject
                  </button>
                  <button
                    onClick={() => saveDecision(item.id, "approve")}
                    className="flex-1 py-1 bg-green-500 text-white text-[11px] font-semibold rounded hover:bg-green-600 transition-colors"
                  >
                    A: Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
