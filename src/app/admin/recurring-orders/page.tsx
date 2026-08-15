"use client";

import { useEffect, useState } from "react";

interface RecurringOrder {
  id: number;
  customerId: number;
  productId: number;
  productName: string;
  quantity: number;
  frequency: string;
  nextOrderDate: string;
  lastOrderDate: string | null;
  status: string;
  pricePerUnit: number;
  totalOrders: number;
  whatsappConfirmed: boolean;
  notes: string | null;
}

const FREQ_LABELS: Record<string, string> = { daily: "Daily", weekly: "Weekly", biweekly: "Bi-weekly", monthly: "Monthly" };

export default function RecurringOrdersPage() {
  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customerId: "", productId: "", productName: "", quantity: "1", frequency: "weekly", pricePerUnit: "", notes: "" });

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/recurring-orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusToggle = async (id: number, current: string) => {
    const next = current === "active" ? "paused" : "active";
    await fetch("/api/admin/recurring-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: next }) });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: next } : o));
  };

  const handleCancel = async (id: number) => {
    await fetch("/api/admin/recurring-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "cancelled" }) });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "cancelled" } : o));
  };

  const handleCreate = async () => {
    if (!form.customerId || !form.productId || !form.productName || !form.pricePerUnit) return;
    const res = await fetch("/api/admin/recurring-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => [data.order, ...prev]);
      setShowCreate(false);
      setForm({ customerId: "", productId: "", productName: "", quantity: "1", frequency: "weekly", pricePerUnit: "", notes: "" });
    }
  };

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  const active = orders.filter((o) => o.status === "active");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recurring Orders</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">+ New Recurring</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{active.length}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Paused</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{orders.filter((o) => o.status === "paused").length}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-gray-500">{orders.filter((o) => o.status === "cancelled").length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "active", "paused", "cancelled"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No recurring orders</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Frequency</th>
                <th className="px-4 py-3 font-medium">Price/Unit</th>
                <th className="px-4 py-3 font-medium">Next Order</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order) => (
                <tr key={order.id} className="text-gray-300">
                  <td className="px-4 py-3 font-medium">{order.productName}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">{FREQ_LABELS[order.frequency] || order.frequency}</span>
                  </td>
                  <td className="px-4 py-3">₹{order.pricePerUnit.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(order.nextOrderDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">{order.totalOrders}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${order.status === "active" ? "bg-green-500/10 text-green-400" : order.status === "paused" ? "bg-yellow-500/10 text-yellow-400" : "bg-gray-500/10 text-gray-400"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {order.status !== "cancelled" && (
                      <>
                        <button onClick={() => handleStatusToggle(order.id, order.status)} className="text-xs text-orange-400 hover:text-orange-300">
                          {order.status === "active" ? "Pause" : "Resume"}
                        </button>
                        <button onClick={() => handleCancel(order.id)} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">New Recurring Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Customer ID</label>
                <input type="number" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Product ID</label>
                <input type="number" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Product Name</label>
                <input type="text" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Quantity</label>
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Price/Unit (₹)</label>
                  <input type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
