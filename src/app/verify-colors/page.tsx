"use client";

import { useState, useEffect, useCallback } from "react";

const MANGO_COLORS: [string, string, string][] = [
  ["red", "RED", "#E31837"],
  ["mango-yellow", "MY", "#E8B830"],
  ["orange", "ORG", "#E8751C"],
  ["citrus-green", "CG", "#97A519"],
  ["mist-blue", "MB", "#567D91"],
  ["black", "BLK", "#231F20"],
  ["dark-grey", "DG", "#555555"],
  ["milky-white", "MW", "#D9D2C6"],
  ["brick-red", "BRD", "#A13D2D"],
  ["rattan-dark-beige", "RDB", "#8C7754"],
  ["sandal-yellow", "SY", "#C8A96E"],
  ["olive-green", "OG", "#4A6741"],
  ["light-peach", "LP", "#D5A583"],
  ["dark-blue", "DB", "#1B1464"],
  ["blue", "BL", "#254B8E"],
  ["globus-brown", "GB", "#4B3621"],
  ["cherry", "CHR", "#7B1818"],
  ["sandal-wood", "SW", "#A0845B"],
  ["teak-wood", "TW", "#6B4226"],
  ["marble-beige", "MBG", "#C8B99A"],
  ["pink", "PNK", "#E55B8B"],
  ["purple", "PRPL", "#6B2FA0"],
  ["new-blue", "NBL", "#2CA5E0"],
  ["eagle-brown", "EB", "#5C3A1E"],
  ["weather-brown", "WB", "#594525"],
  ["neo-blue", "NB", "#35A0CB"],
  ["flask-maroon", "FM", "#8B2232"],
  ["green", "GRN", "#2D8C3C"],
  ["ivory", "IVR", "#D4CEB5"],
  ["marble-gray", "MGR", "#B0ADA6"],
  ["plaza-top", "PT", "#8F7B56"],
  ["forest-green", "FG", "#1E6B4A"],
  ["navy-blue", "NVB", "#16213D"],
  ["marina-blue", "MBL", "#2E8BC0"],
  ["rose-red", "RR", "#C92A42"],
  ["dark-peach", "DP", "#C07A5A"],
  ["siesta-brown", "SB", "#5C4827"],
  ["neo-yellow", "NY", "#E8C31A"],
  ["lush-green", "LG", "#38763B"],
  ["gold", "GLD", "#C6932A"],
];

function textColorFor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#1A1A1A" : "#FFFFFF";
}

export default function VerifyColorsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, string[]>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pickedHex, setPickedHex] = useState<string | null>(null);
  const [newColorName, setNewColorName] = useState("");
  const [customColors, setCustomColors] = useState<[string, string, string][]>([]);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const allColors = [...MANGO_COLORS, ...customColors];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    fetch("/api/color-verify?list=true")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories);
        setProductsMap(d.products);
      });
  }, []);

  const loadImages = async (cat: string, prod: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      if (prod) params.set("product", prod);
      params.set("all", "true");
      const res = await fetch(`/api/color-verify?${params}`);
      const data = await res.json();
      setImages(data.images);
      setAssignments(data.assignments || {});
      setCurrentIndex(0);
      if (data.images.length > 0) {
        await loadImageByIndex(0, data.images);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadImageByIndex = async (idx: number, imgs?: string[]) => {
    const list = imgs || images;
    if (idx < 0 || idx >= list.length) return;
    try {
      const catProd = list[idx].split("/").slice(0, 2).join("/");
      const params = new URLSearchParams({ index: String(idx) });
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedProduct) params.set("product", selectedProduct);
      const res = await fetch(`/api/color-verify?${params}`);
      const data = await res.json();
      setCurrentImage(data);
      setSelectedColors(data.assigned || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (images.length > 0 && currentIndex >= 0) {
      loadImageByIndex(currentIndex);
    }
  }, [currentIndex]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedProduct("");
    setImages([]);
    setCurrentImage(null);
    setCurrentIndex(0);
    if (cat && productsMap[cat]?.length === 1) {
      setSelectedProduct(productsMap[cat][0]);
      loadImages(cat, productsMap[cat][0]);
    } else if (cat) {
      loadImages(cat, "");
    }
  };

  const handleProductChange = (prod: string) => {
    setSelectedProduct(prod);
    loadImages(selectedCategory, prod);
  };

  const toggleColor = (name: string) => {
    setSelectedColors((prev) => {
      const idx = prev.indexOf(name);
      if (idx === -1) return [...prev, name];
      return prev.filter((c) => c !== name);
    });
  };

  const pushRecent = (colors: string[]) => {
    setRecentColors((prev) => {
      let updated = [...prev];
      for (const c of colors) {
        updated = updated.filter((x) => x !== c);
        updated.unshift(c);
      }
      return updated.slice(0, 9);
    });
  };

  const handleSave = async () => {
    if (selectedColors.length === 0 || !currentImage) return;
    setSaving(true);
    try {
      const res = await fetch("/api/color-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: currentImage.image, colors: selectedColors }),
      });
      if (res.ok) {
        setAssignments((p) => ({ ...p, [currentImage.image]: selectedColors }));
        pushRecent(selectedColors);
        showToast("Saved!");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleRenameAndNext = async () => {
    if (selectedColors.length === 0 || !currentImage) return;
    setSaving(true);
    try {
      const res = await fetch("/api/color-verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: currentImage.image, colors: selectedColors }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments((p) => {
          const u = { ...p };
          delete u[data.oldPath];
          u[data.newPath] = selectedColors;
          return u;
        });
        pushRecent(selectedColors);
        showToast(`Renamed to ${data.newPath.split("/").pop()}`);
        if (currentIndex < images.length - 1) {
          const newImages = [...images];
          newImages[currentIndex] = data.newPath;
          setImages(newImages);
          setCurrentIndex((p) => p + 1);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleUndo = async () => {
    try {
      const res = await fetch("/api/color-verify", { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        showToast(`Restored ${data.restored.split("/").pop()}`);
        if (selectedCategory || selectedProduct) {
          loadImages(selectedCategory, selectedProduct);
        }
      } else {
        const data = await res.json();
        showToast(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEyeDrop = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const ed = new (window as any).EyeDropper();
        const result = await ed.open();
        setPickedHex(result.sRGBHex);
      } catch (e) {}
    } else {
      showToast("Eyedropper not supported — use Chrome/Edge");
    }
  };

  const handleAddColor = () => {
    const name = newColorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!name) { showToast("Name the color first"); return; }
    if (!pickedHex) { showToast("Pick a hex first"); return; }
    if (allColors.some((c) => c[0] === name)) { showToast("Already exists"); return; }
    const code = name.split("-").map((w) => w[0].toUpperCase()).join("").slice(0, 4);
    setCustomColors((p) => [...p, [name, code, pickedHex]]);
    setSelectedColors((p) => [...p, name]);
    setNewColorName("");
    showToast(`Added "${name}"`);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(assignments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-verify-results.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded");
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) setCurrentIndex((p) => p + 1);
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((p) => p - 1);
      if (e.key === "Enter" && selectedColors.length > 0) handleRenameAndNext();
      if (e.key === "u" || e.key === "U") handleUndo();
      if (e.key === "Escape") setSelectedColors([]);
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const idx = num - 1;
        if (idx < recentColors.length) {
          const colorName = recentColors[idx];
          setSelectedColors((sel) => {
            if (sel.includes(colorName)) return sel;
            return [...sel, colorName];
          });
        }
      }
    },
    [currentIndex, images, selectedColors, recentColors]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderSwatch = (name: string, code: string, hex: string, idx: number) => {
    const isCustom = idx >= MANGO_COLORS.length;
    const order = selectedColors.indexOf(name);
    const tc = textColorFor(hex);
    return (
      <button
        key={name}
        onClick={() => toggleColor(name)}
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 10,
          overflow: "hidden",
          border: `2px solid ${order !== -1 ? "#7C8CFF" : "#2B2E35"}`,
          background: "#202329",
          cursor: "pointer",
          position: "relative",
          boxShadow: order !== -1 ? "0 0 0 2px #7C8CFF33" : "none",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "1.2",
            background: hex,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          {order !== -1 && (
            <span
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#7C8CFF",
                color: "#0F1013",
                fontSize: 9,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Space Grotesk, sans-serif",
                zIndex: 2,
              }}
            >
              {order + 1}
            </span>
          )}
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 5px",
              borderRadius: 3,
              margin: 4,
              background: `${hex}CC`,
              color: tc,
              letterSpacing: 0.3,
            }}
          >
            {code}
          </span>
        </div>
        <div
          style={{
            padding: "4px 3px",
            fontSize: 9.5,
            fontWeight: 600,
            textAlign: "center",
            fontFamily: "Space Grotesk, sans-serif",
            color: "#ECEDEF",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}{isCustom ? " *" : ""}
        </div>
      </button>
    );
  };

  const term = searchTerm.toLowerCase();
  const filtered = allColors.filter(
    ([name, code, hex]) =>
      !term || name.includes(term) || code.toLowerCase().includes(term) || hex.toLowerCase().includes(term)
  );
  const leftColors = filtered.slice(0, 20);
  const rightColors = filtered.slice(20);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #121317; color: #ECEDEF; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
        ::selection { background: #7C8CFF33; }
        input:focus { outline: 2px solid #7C8CFF; border-color: transparent; }
        .center-panel { overflow-y: auto; overflow-x: hidden; }
        .center-panel::-webkit-scrollbar { width: 5px; }
        .center-panel::-webkit-scrollbar-track { background: transparent; }
        .center-panel::-webkit-scrollbar-thumb { background: #2B2E35; border-radius: 10px; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", height: "100vh", overflow: "hidden" }}>
        {/* LEFT PALETTE */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #2B2E35",
            overflowY: "auto",
            padding: 10,
            scrollbarWidth: "thin",
            scrollbarColor: "#2B2E35 transparent",
          }}
        >
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700, color: "#8B8F99", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Colors 1–20
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {leftColors.map((c, i) => renderSwatch(c[0], c[1], c[2], allColors.indexOf(c)))}
          </div>
        </div>

        {/* CENTER */}
        <div className="center-panel" style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid #2B2E35", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, fontWeight: 700 }}>Mango Color Labeler</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#8B8F99" }}>server-backed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 8, color: "#ECEDEF", padding: "6px 8px", fontSize: 12 }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {selectedCategory && productsMap[selectedCategory] && (
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 8, color: "#ECEDEF", padding: "6px 8px", fontSize: 12 }}
                >
                  <option value="">All products</option>
                  {productsMap[selectedCategory].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#8B8F99", padding: "5px 10px", border: "1px solid #2B2E35", borderRadius: 999 }}>
                {images.length} images
              </span>
            </div>
          </div>

          {/* Image area */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 16px 0", minWidth: 0 }}>
            {!currentImage ? (
              <div style={{ textAlign: "center", color: "#8B8F99", marginTop: "10vh" }}>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, color: "#ECEDEF", marginBottom: 8 }}>Select a category and product</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>Pick from the dropdowns above to load images for color labeling.</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#8B8F99", marginBottom: 6 }}>
                  <b style={{ color: "#ECEDEF", fontWeight: 600 }}>{currentIndex + 1}</b> / {images.length}
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    maxHeight: "60vh",
                    border: "1px solid #2B2E35",
                    borderRadius: 12,
                    background: "#1B1D22",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(45deg, #1c1e24 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(-45deg, #1c1e24 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(45deg, transparent 75%, #1c1e24 75%) -12px 0/24px 24px, linear-gradient(-45deg, transparent 75%, #1c1e24 75%) -12px 0/24px 24px, #17181c",
                      position: "relative",
                    }}
                  >
                    <img
                      src={currentImage.base64}
                      alt=""
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", userSelect: "none" }}
                      draggable={false}
                    />
                    {/* Nav buttons - bottom corners of image card */}
                    <button
                      onClick={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
                      disabled={currentIndex === 0}
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#202329",
                        border: "1px solid #2B2E35",
                        fontSize: 16,
                        color: "#ECEDEF",
                        cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                        opacity: currentIndex === 0 ? 0.25 : 1,
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => currentIndex < images.length - 1 && setCurrentIndex((p) => p + 1)}
                      disabled={currentIndex === images.length - 1}
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#202329",
                        border: "1px solid #2B2E35",
                        fontSize: 16,
                        color: "#ECEDEF",
                        cursor: currentIndex === images.length - 1 ? "not-allowed" : "pointer",
                        opacity: currentIndex === images.length - 1 ? 0.25 : 1,
                      }}
                    >
                      →
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderTop: "1px solid #2B2E35", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#8B8F99", gap: 8 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#ECEDEF" }}>{currentImage.image?.split("/").pop()}</span>
                    {selectedColors.length > 0 && (
                      <span style={{ flexShrink: 0, padding: "2px 7px", borderRadius: 999, background: "#7C8CFF33", color: "#7C8CFF", fontSize: 10 }}>{selectedColors.join("-")}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom bar */}
          {currentImage && (
            <div style={{ padding: "8px 16px 12px", flexShrink: 0 }}>
              {/* Eyedropper row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <button onClick={handleEyeDrop} style={{ padding: "7px 10px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, background: "#202329", border: "1px solid #2B2E35", borderRadius: 10, color: "#ECEDEF", cursor: "pointer" }}>
                  💧 Pick
                </button>
                {pickedHex && (
                  <>
                    <div style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #2B2E35", background: pickedHex, flexShrink: 0 }} />
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#ECEDEF" }}>{pickedHex}</span>
                  </>
                )}
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="name for this hex"
                  style={{ flex: 1, minWidth: 120, background: "#202329", border: "1px solid #2B2E35", borderRadius: 10, color: "#ECEDEF", padding: "7px 10px", fontSize: 12 }}
                />
                <button onClick={handleAddColor} style={{ padding: "7px 10px", fontSize: 12, whiteSpace: "nowrap", background: "#202329", border: "1px solid #2B2E35", borderRadius: 10, color: "#ECEDEF", cursor: "pointer" }}>Add</button>
              </div>

              {/* Blend strip */}
              <div style={{ width: "100%", height: 24, borderRadius: 6, overflow: "hidden", display: "flex", border: "1px solid #2B2E35", background: "#202329", marginBottom: 6 }}>
                {selectedColors.length === 0 ? (
                  <span style={{ margin: "auto", color: "#8B8F99", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>select colors to preview</span>
                ) : (
                  selectedColors.map((name) => {
                    const c = allColors.find((x) => x[0] === name);
                    return <div key={name} style={{ flex: 1, height: "100%", background: c ? c[2] : "#888" }} />;
                  })
                )}
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#8B8F99", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span>save as:</span>
                <span style={{ color: "#7C8CFF", fontWeight: 600 }}>{selectedColors.length > 0 ? selectedColors.join("-") : "—"}</span>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={handleUndo} style={{ padding: "7px 12px", fontSize: 12, fontWeight: 500, background: "#202329", border: "1px solid #3A2626", borderRadius: 10, color: "#FF6B6B", cursor: "pointer" }}>↺ Undo</button>
                <button onClick={() => setSelectedColors([])} style={{ padding: "7px 12px", fontSize: 12, fontWeight: 500, background: "#202329", border: "1px solid #2B2E35", borderRadius: 10, color: "#ECEDEF", cursor: "pointer" }}>Clear</button>
                <button onClick={handleDownload} style={{ padding: "7px 12px", fontSize: 12, fontWeight: 500, background: "#202329", border: "1px solid #3A3226", borderRadius: 10, color: "#FFB454", cursor: "pointer" }}>↓ JSON</button>
                <div style={{ flex: 1 }} />
                <button
                  onClick={handleSave}
                  disabled={saving || selectedColors.length === 0}
                  style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, background: selectedColors.length > 0 ? "#7C8CFF" : "#202329", color: selectedColors.length > 0 ? "#0F1013" : "#8B8F99", border: `1px solid ${selectedColors.length > 0 ? "#7C8CFF" : "#2B2E35"}`, borderRadius: 10, cursor: selectedColors.length > 0 ? "pointer" : "not-allowed" }}
                >
                  {saving ? "..." : "Save only"}
                </button>
                <button
                  onClick={handleRenameAndNext}
                  disabled={saving || selectedColors.length === 0}
                  style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, background: selectedColors.length > 0 ? "#7C8CFF" : "#202329", color: selectedColors.length > 0 ? "#0F1013" : "#8B8F99", border: `1px solid ${selectedColors.length > 0 ? "#7C8CFF" : "#2B2E35"}`, borderRadius: 10, cursor: selectedColors.length > 0 ? "pointer" : "not-allowed" }}
                >
                  {saving ? "..." : "Rename & next"}
                </button>
              </div>
              {/* Recent colors bar */}
              {recentColors.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                  {recentColors.map((name, i) => {
                    const c = allColors.find((x) => x[0] === name);
                    if (!c) return null;
                    return (
                      <div
                        key={name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "#202329",
                          border: "1px solid #2B2E35",
                          fontSize: 9,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#8B8F99",
                        }}
                      >
                        <span style={{ color: "#7C8CFF", fontWeight: 700, fontSize: 9 }}>{i + 1}</span>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c[2] }} />
                        <span>{name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginTop: 6, fontSize: 10, color: "#8B8F99", fontFamily: "JetBrains Mono, monospace", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span><kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#ECEDEF" }}>←</kbd><kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#ECEDEF" }}>→</kbd> nav</span>
                <span><kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#ECEDEF" }}>Enter</kbd> save</span>
                <span><kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#ECEDEF" }}>U</kbd> undo</span>
                <span><kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#ECEDEF" }}>1</kbd>-<kbd style={{ background: "#202329", border: "1px solid #2B2E35", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#ECEDEF" }}>9</kbd> recent</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PALETTE */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #2B2E35",
            overflowY: "auto",
            padding: 10,
            scrollbarWidth: "thin",
            scrollbarColor: "#2B2E35 transparent",
          }}
        >
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700, color: "#8B8F99", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Colors 21–40
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {rightColors.map((c, i) => renderSwatch(c[0], c[1], c[2], allColors.indexOf(c)))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#202329",
            border: "1px solid #2B2E35",
            color: "#ECEDEF",
            padding: "9px 16px",
            borderRadius: 999,
            fontSize: 12,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
