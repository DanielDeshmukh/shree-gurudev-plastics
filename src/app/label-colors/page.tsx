"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ColorItem {
  id: number;
  imageUrl: string;
  localUrl: string | null;
  productName: string;
  dbColor: string;
  newColor: string | null;
  decided: boolean;
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

function serveUrl(imageUrl: string): string {
  return `/api/serve-image?url=${encodeURIComponent(imageUrl)}`;
}

export default function LabelColorsPage() {
  const [items, setItems] = useState<ColorItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ColorItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending" | "decided">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, decided: 0, pending: 0 });
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [productFilter, setProductFilter] = useState<string>("");
  const [products, setProducts] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(() => {
    const params = new URLSearchParams();
    if (productFilter) params.set("product", productFilter);
    params.set("status", filter === "all" ? "all" : filter);
    fetch(`/api/label-colors?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setFilteredItems(data.items);
        setStats(data.stats);
        if (data.products) setProducts(data.products);
        setLoading(false);
      });
  }, [productFilter, filter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {}, []);

  useEffect(() => {
    setCursor(0);
  }, [filter, productFilter]);

  const saveColor = useCallback(
    async (id: number, color: string) => {
      if (!color.trim()) return;
      setSaving(true);
      await fetch("/api/label-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: id, newColor: color.trim() }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, newColor: color.trim(), decided: true } : i))
      );
      setSaving(false);
    },
    []
  );

  const clearDecision = useCallback(async (id: number) => {
    setSaving(true);
    await fetch(`/api/label-colors?imageId=${id}`, { method: "DELETE" });
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, newColor: null, decided: false } : i))
    );
    setSaving(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const item = filteredItems[cursor];
      if (!item) return;

      if (e.key === "Enter") {
        e.preventDefault();
        const color = edits[item.id] || "";
        if (color.trim()) {
          saveColor(item.id, color);
          setEdits((prev) => ({ ...prev, [item.id]: "" }));
          if (cursor < filteredItems.length - 1) setCursor((c) => c + 1);
        }
      } else if (e.key === "Backspace" && !edits[item.id]) {
        e.preventDefault();
        clearDecision(item.id);
      } else if (e.key === "ArrowRight" || e.key === "j") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filteredItems.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Tab") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filteredItems.length - 1));
      }
    },
    [cursor, filteredItems, edits, saveColor, clearDecision]
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
    if (inputRef.current) inputRef.current.focus();
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
              {(["all", "pending", "decided"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    filter === f
                      ? f === "decided"
                        ? "bg-green-600 text-white"
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
              <span className="text-green-600">{stats.decided} decided</span>
              {" | "}
              <span className="text-gray-500">{stats.pending} pending</span>
              {saving && <span className="ml-2 text-blue-500">Saving...</span>}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 flex-wrap">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Enter</kbd> Save & Next &nbsp;
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Backspace</kbd> Clear &nbsp;
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Tab</kbd> Next &nbsp;
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">←→</kbd> Navigate
            </div>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item, idx) => {
            const editValue = edits[item.id] ?? (item.newColor || "");
            const matchedColor = getColorHex(editValue);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg overflow-hidden shadow-sm border-2 transition-all ${
                  idx === cursor
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : item.decided
                    ? "border-green-400"
                    : "border-transparent"
                }`}
              >
                <div className="aspect-square bg-gray-50 relative">
                  <img
                    src={item.localUrl || serveUrl(item.imageUrl)}
                    alt={item.productName}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  {item.decided && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-green-600">
                      DONE
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-xs text-gray-500 truncate" title={item.productName}>
                    {item.productName}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-10">From:</span>
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: getColorHex(item.dbColor) }}
                    />
                    <span className="font-medium text-gray-700 truncate">{item.dbColor}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-10">To:</span>
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: matchedColor }}
                    />
                    <input
                      ref={idx === cursor ? inputRef : undefined}
                      type="text"
                      value={editValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEdits((prev) => ({ ...prev, [item.id]: val }));
                        if (item.decided && val !== item.newColor) {
                          clearDecision(item.id);
                        }
                      }}
                      placeholder="type color name..."
                      className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.keys(MANGO_COLORS)
                      .filter((c) => {
                        const search = (edits[item.id] || "").toLowerCase().replace(/[\s_]/g, "");
                        if (!search) return false;
                        return c.replace(/_/g, "").includes(search);
                      })
                      .slice(0, 6)
                      .map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setEdits((prev) => ({ ...prev, [item.id]: c.replace(/_/g, " ") }));
                          }}
                          className="px-1.5 py-0.5 text-[10px] rounded border border-gray-200 hover:bg-gray-100 flex items-center gap-1"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: MANGO_COLORS[c] }}
                          />
                          {c.replace(/_/g, " ")}
                        </button>
                      ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const color = edits[item.id] || "";
                        if (color.trim()) {
                          saveColor(item.id, color);
                          setEdits((prev) => ({ ...prev, [item.id]: "" }));
                          if (cursor < filteredItems.length - 1) setCursor((c) => c + 1);
                        }
                      }}
                      className="flex-1 py-1.5 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    {item.decided && (
                      <button
                        onClick={() => clearDecision(item.id)}
                        className="py-1.5 px-3 bg-gray-200 text-gray-600 text-xs font-semibold rounded hover:bg-gray-300 transition-colors"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
