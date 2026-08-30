"use client";

import { useEffect, useState } from "react";

interface Supplier { id: number; name: string; phone: string; email: string | null; address: string | null; gstNumber: string | null; notes: string | null; }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", gstNumber: "", notes: "" });

  useEffect(() => { fetch("/api/admin/suppliers", { credentials: "include" }).then(r => r.json()).then(d => { setSuppliers(d.suppliers || []); setLoading(false); }); }, []);

  const handleSave = async () => {
    if (!form.name || !form.phone) return;
    const url = "/api/admin/suppliers";
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      if (editId) { setSuppliers((prev) => prev.map((s) => s.id === editId ? data.supplier : s)); }
      else { setSuppliers((prev) => [data.supplier, ...prev]); }
      setShowCreate(false); setEditId(null); setForm({ name: "", phone: "", email: "", address: "", gstNumber: "", notes: "" });
    }
  };

  const handleEdit = (s: Supplier) => { setForm({ name: s.name, phone: s.phone, email: s.email || "", address: s.address || "", gstNumber: s.gstNumber || "", notes: s.notes || "" }); setEditId(s.id); setShowCreate(true); };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/suppliers?id=${id}`, { method: "DELETE", credentials: "include" });
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suppliers</h2>
        <button onClick={() => { setShowCreate(true); setEditId(null); setForm({ name: "", phone: "", email: "", address: "", gstNumber: "", notes: "" }); }} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">+ Add Supplier</button>
      </div>
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No suppliers yet</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-gray-800 text-gray-400"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">GSTIN</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {suppliers.map((s) => (
                <tr key={s.id} className="text-gray-300">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3 text-gray-400">{s.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{s.gstNumber || "—"}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => handleEdit(s)} className="text-xs text-primary-400 hover:text-primary-300">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
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
            <h3 className="mb-4 text-lg font-bold">{editId ? "Edit Supplier" : "Add Supplier"}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-300 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Phone *</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">GST Number</label><input type="text" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Notes</label><input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowCreate(false); setEditId(null); }} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">{editId ? "Update" : "Create"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
