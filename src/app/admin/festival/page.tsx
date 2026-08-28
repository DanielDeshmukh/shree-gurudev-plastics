"use client";

import { useState, useEffect } from "react";
import { MdCelebration, MdSave } from "react-icons/md";

const FESTIVALS = [
  { slug: "ganesh_chaturthi", name: "Ganesh Chaturthi", color: "text-orange-400" },
  { slug: "diwali", name: "Diwali", color: "text-amber-400" },
  { slug: "holi", name: "Holi", color: "text-pink-400" },
  { slug: "navratri", name: "Navratri", color: "text-red-400" },
  { slug: "christmas", name: "Christmas", color: "text-red-400" },
  { slug: "new_year", name: "New Year", color: "text-blue-400" },
];

export default function FestivalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [slug, setSlug] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [bannerMessage, setBannerMessage] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch("/api/admin/festival", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.enabled);
        setSlug(d.slug || "");
        setDiscountPct(d.discountPct || 0);
        setBannerMessage(d.bannerMessage || "");
        if (d.endDate) {
          const dt = new Date(d.endDate);
          setEndDate(new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        }
      })
      .catch(() => showToast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/festival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          enabled,
          slug,
          discountPct,
          bannerMessage,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        }),
      });
      if (res.ok) {
        document.documentElement.setAttribute("data-festival", enabled ? slug : "");
        localStorage.setItem("festival_update", Date.now().toString());
        showToast("Festival settings saved!");
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const selectedFestival = FESTIVALS.find((f) => f.slug === slug);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${toast.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <MdCelebration className="text-2xl text-orange-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Festival Settings</h1>
          <p className="text-sm text-gray-400">Manage seasonal festival themes and offers</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Festival Mode</p>
            <p className="text-xs text-gray-400">Enable seasonal theme across the website</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-14 h-7 rounded-full transition-colors ${enabled ? "bg-orange-500" : "bg-gray-600"}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${enabled ? "translate-x-7" : ""}`} />
          </button>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Select Festival</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FESTIVALS.map((f) => (
              <button
                key={f.slug}
                onClick={() => setSlug(f.slug)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  slug === f.slug
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Festival Discount (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            value={discountPct}
            onChange={(e) => setDiscountPct(parseInt(e.target.value) || 0)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Applied at checkout for all products. 0 = no discount.</p>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Banner Message</label>
          <input
            type="text"
            value={bannerMessage}
            onChange={(e) => setBannerMessage(e.target.value)}
            placeholder="e.g. Ganpati Bappa Morya! Special festive offers!"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">End Date (auto-disable)</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Festival mode automatically disables after this date.</p>
        </div>

        {selectedFestival && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Preview</p>
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-4 py-3 text-center">
                <p className="text-white font-bold text-sm">{bannerMessage || `${selectedFestival.name} Special Offers!`}</p>
                {discountPct > 0 && <p className="text-white/80 text-xs mt-1">Up to {discountPct}% off on all products</p>}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <MdSave size={16} />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
