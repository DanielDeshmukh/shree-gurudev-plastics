"use client";

import { useEffect, useState } from "react";

interface PurchaseOrder { id: number; supplierId: number; productId: number; productName: string; quantity: number; unitCost: number; totalCost: number; status: string; expectedDate: string | null; receivedDate: string | null; invoiceNumber: string | null; notes: string | null; }

const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-500/10 text-yellow-400", ordered: "bg-blue-500/10 text-blue-400", received: "bg-green-500/10 text-green-400", cancelled: "bg-gray-500/10 text-gray-400" };

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ supplierId: "", productId: "", productName: "", quantity: "1", unitCost: "", expectedDate: "", invoiceNumber: "", notes: "" });

  useEffect(() => { fetch("/api/admin/purchase-orders", { credentials: "include" }).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); }); }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    const body: Record<string, unknown> = { id, status };
    if (status === "received") body.receivedDate = new Date().toISOString();
    await fetch("/api/admin/purchase-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status, receivedDate: status === "received" ? new Date().toISOString() : o.receivedDate } : o));
  };

  const handleCreate = async () => {
    if (!form.supplierId || !form.productId || !form.productName || !form.unitCost) return;
    const res = await fetch("/api/admin/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) || 1, unitCost: parseFloat(form.unitCost) }), credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => [data.order, ...prev]);
      setShowCreate(false);
      setForm({ supplierId: "", productId: "", productName: "", quantity: "1", unitCost: "", expectedDate: "", invoiceNumber: "", notes: "" });
    }
  };

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  const totalPending = orders.filter((o) => o.status === "pending" || o.status === "ordered").reduce((sum, o) => sum + o.totalCost, 0);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Purchase Orders</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">+ New PO</button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Pending</p><p className="mt-1 text-2xl font-bold text-yellow-400">{orders.filter((o) => o.status === "pending").length}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">In Transit</p><p className="mt-1 text-2xl font-bold text-blue-400">{orders.filter((o) => o.status === "ordered").length}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Total Value (Pending)</p><p className="mt-1 text-2xl font-bold text-primary-400">₹{totalPending.toLocaleString("en-IN")}</p></div>
      </div>
      <div className="flex gap-2">
        {["all", "pending", "ordered", "received", "cancelled"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>{s}</button>
        ))}
      </div>
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {filtered.length === 0 ? <div className="p-8 text-center text-gray-500">No purchase orders</div> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-gray-800 text-gray-400"><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Qty</th><th className="px-4 py-3 font-medium">Unit Cost</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Expected</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((o) => (
                <tr key={o.id} className="text-gray-300">
                  <td className="px-4 py-3 font-medium">{o.productName}</td>
                  <td className="px-4 py-3">{o.quantity}</td>
                  <td className="px-4 py-3">₹{o.unitCost.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium">₹{o.totalCost.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-400">{o.expectedDate ? new Date(o.expectedDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}>{o.status}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    {o.status === "pending" && <button onClick={() => handleStatusUpdate(o.id, "ordered")} className="text-xs text-blue-400 hover:text-blue-300">Mark Ordered</button>}
                    {o.status === "ordered" && <button onClick={() => handleStatusUpdate(o.id, "received")} className="text-xs text-green-400 hover:text-green-300">Mark Received</button>}
                    {(o.status === "pending" || o.status === "ordered") && <button onClick={() => handleStatusUpdate(o.id, "cancelled")} className="text-xs text-red-400 hover:text-red-300">Cancel</button>}
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
            <h3 className="mb-4 text-lg font-bold">New Purchase Order</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-300 mb-1">Supplier ID *</label><input type="number" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Product ID *</label><input type="number" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Product Name *</label><input type="text" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-300 mb-1">Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Unit Cost (₹) *</label><input type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              </div>
              <div><label className="block text-sm text-gray-300 mb-1">Expected Date</label><input type="date" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Invoice Number</label><input type="text" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
