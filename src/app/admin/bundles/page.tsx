"use client";

import { useEffect, useState } from "react";
import { MdCheck, MdClose } from "react-icons/md";

interface BundleItem { id: number; productId: number; quantity: number; }
interface Bundle { id: number; name: string; description: string | null; imageUrl: string | null; totalOriginal: number; bundlePrice: number; discount: number; active: boolean; items: BundleItem[]; }

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", totalOriginal: "", bundlePrice: "" });
  const [items, setItems] = useState<{ productId: string; quantity: string }[]>([{ productId: "", quantity: "1" }]);

  useEffect(() => { fetch("/api/admin/bundles").then(r => r.json()).then(d => { setBundles(d.bundles || []); setLoading(false); }); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.totalOriginal || !form.bundlePrice || items.some(i => !i.productId)) return;
    const res = await fetch("/api/admin/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalOriginal: parseFloat(form.totalOriginal),
        bundlePrice: parseFloat(form.bundlePrice),
        items: items.filter(i => i.productId).map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) || 1 })),
      }),
    });
    if (res.ok) { const data = await res.json(); setBundles(prev => [data.bundle, ...prev]); setShowCreate(false); setForm({ name: "", description: "", imageUrl: "", totalOriginal: "", bundlePrice: "" }); setItems([{ productId: "", quantity: "1" }]); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/bundles?id=${id}`, { method: "DELETE" });
    setBundles(prev => prev.filter(b => b.id !== id));
  };

  const handleToggle = async (id: number, active: boolean) => {
    await fetch("/api/admin/bundles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active: !active }) });
    setBundles(prev => prev.map(b => b.id === id ? { ...b, active: !active } : b));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Bundles</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">+ New Bundle</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Active Bundles</p><p className="mt-1 text-2xl font-bold text-green-400">{bundles.filter(b => b.active).length}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Inactive</p><p className="mt-1 text-2xl font-bold text-gray-500">{bundles.filter(b => !b.active).length}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Avg Discount</p><p className="mt-1 text-2xl font-bold text-primary-400">₹{bundles.length > 0 ? Math.round(bundles.reduce((s, b) => s + b.discount, 0) / bundles.length) : 0}</p></div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {bundles.length === 0 ? <div className="p-8 text-center text-gray-500">No bundles yet</div> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-gray-800 text-gray-400"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Items</th><th className="px-4 py-3 font-medium">Original</th><th className="px-4 py-3 font-medium">Bundle</th><th className="px-4 py-3 font-medium">Savings</th><th className="px-4 py-3 font-medium">Active</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {bundles.map(b => (
                <tr key={b.id} className="text-gray-300">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3">{b.items.length}</td>
                  <td className="px-4 py-3 text-gray-400">₹{b.totalOriginal.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium">₹{b.bundlePrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-green-400">₹{b.discount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{b.active ? <span className="text-green-400"><MdCheck /></span> : <span className="text-gray-500"><MdClose /></span>}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => handleToggle(b.id, b.active)} className="text-xs text-primary-400 hover:text-primary-300">{b.active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold">Create Bundle</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-300 mb-1">Bundle Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-300 mb-1">Original Total (₹) *</label><input type="number" value={form.totalOriginal} onChange={e => setForm({...form, totalOriginal: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Bundle Price (₹) *</label><input type="number" value={form.bundlePrice} onChange={e => setForm({...form, bundlePrice: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              </div>
              {form.totalOriginal && form.bundlePrice && <p className="text-sm text-green-400">Customer saves ₹{(parseFloat(form.totalOriginal) - parseFloat(form.bundlePrice)).toLocaleString("en-IN")}</p>}

              <div>
                <label className="block text-sm text-gray-300 mb-1">Bundle Items</label>
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="number" placeholder="Product ID" value={item.productId} onChange={e => { const n = [...items]; n[idx].productId = e.target.value; setItems(n); }} className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" />
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = e.target.value; setItems(n); }} className="w-20 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" />
                    {items.length > 1 && <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 text-sm"><MdClose /></button>}
                  </div>
                ))}
                <button onClick={() => setItems([...items, { productId: "", quantity: "1" }])} className="text-xs text-primary-400 hover:text-primary-300">+ Add Item</button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700">Cancel</button>
                <button onClick={handleCreate} className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">Create Bundle</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
