"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface PriceLock {
  id: number;
  productId: number;
  product: { id: number; name: string; color: string } | null;
  lockedPrice: number;
  lockedAt: string;
  expiresAt: string;
  status: string;
  notes: string | null;
}

interface PriceHistory {
  id: number;
  productId: number;
  product: { id: number; name: string; color: string } | null;
  oldPrice: number;
  newPrice: number;
  changedBy: string | null;
  reason: string | null;
  createdAt: string;
}

export default function PriceLockPage() {
  const { toast } = useToast();
  const [locks, setLocks] = useState<PriceLock[]>([]);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"locks" | "history">("locks");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ productId: "", lockedPrice: "", durationHours: "48", notes: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/price-lock", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/price-history", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/products?ungrouped=true&limit=9999", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([locksData, historyData, productsData]) => {
        setLocks(locksData.locks || []);
        setHistory(historyData.history || []);
        setProducts((productsData.products || []).map((p: any) => ({ id: p.id, name: p.name, color: p.color })));
      })
      .catch(() => toast("Failed to load price data", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateLock = async () => {
    if (!form.productId || !form.lockedPrice) return;
    const res = await fetch("/api/admin/price-lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, productId: parseInt(form.productId), lockedPrice: parseFloat(form.lockedPrice), durationHours: parseInt(form.durationHours) }),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setLocks((prev) => [data.lock, ...prev]);
      setShowCreate(false);
      setForm({ productId: "", lockedPrice: "", durationHours: "48", notes: "" });
    }
  };

  const handleDeleteLock = async (id: number) => {
    await fetch(`/api/admin/price-lock?id=${id}`, { method: "DELETE", credentials: "include" });
    setLocks((prev) => prev.filter((l) => l.id !== id));
  };

  const activeLocks = locks.filter((l) => l.status === "active" && new Date(l.expiresAt) > new Date());
  const expiredLocks = locks.filter((l) => l.status !== "active" || new Date(l.expiresAt) <= new Date());

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Price Lock & History</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
          + Lock Price
        </button>
      </div>

      <div className="flex gap-2">
        {(["locks", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {t === "locks" ? "Price Locks" : "Price History"}
          </button>
        ))}
      </div>

      {tab === "locks" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <p className="text-sm text-gray-400">Active Locks</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{activeLocks.length}</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <p className="text-sm text-gray-400">Expired Locks</p>
              <p className="mt-1 text-2xl font-bold text-gray-500">{expiredLocks.length}</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            {locks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No price locks yet</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Locked Price</th>
                    <th className="px-4 py-3 font-medium">Locked At</th>
                    <th className="px-4 py-3 font-medium">Expires At</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {locks.map((lock) => {
                    const isExpired = new Date(lock.expiresAt) <= new Date();
                    return (
                      <tr key={lock.id} className="text-gray-300">
                        <td className="px-4 py-3">{lock.product ? `${lock.product.name} (${lock.product.color})` : `#${lock.productId}`}</td>
                        <td className="px-4 py-3 font-medium">₹{lock.lockedPrice.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(lock.lockedAt).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(lock.expiresAt).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isExpired ? "bg-gray-500/10 text-gray-400" : "bg-green-500/10 text-green-400"}`}>
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!isExpired && (
                            <button onClick={() => handleDeleteLock(lock.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No price changes recorded yet</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Old Price</th>
                  <th className="px-4 py-3 font-medium">New Price</th>
                  <th className="px-4 py-3 font-medium">Changed By</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((h) => (
                  <tr key={h.id} className="text-gray-300">
                    <td className="px-4 py-3">{h.product ? `${h.product.name} (${h.product.color})` : `#${h.productId}`}</td>
                    <td className="px-4 py-3">₹{h.oldPrice.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 font-medium">₹{h.newPrice.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-400">{h.changedBy || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{h.reason || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(h.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">Lock Product Price</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Product</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500">
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.color})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Locked Price (₹)</label>
                <input type="number" value={form.lockedPrice} onChange={(e) => setForm({ ...form, lockedPrice: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Duration (hours)</label>
                <select value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500">
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                  <option value="168">7 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Confirmed order, bulk deal" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleCreateLock} className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">Lock Price</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
