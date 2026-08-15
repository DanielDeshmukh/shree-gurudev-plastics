"use client";

import { useEffect, useState } from "react";

interface LedgerEntry { id: number; customerId: number; orderId: number | null; type: string; amount: number; balance: number; description: string; referenceNo: string | null; createdAt: string; }

const TYPE_COLORS: Record<string, string> = { credit: "bg-green-500/10 text-green-400", debit: "bg-red-500/10 text-red-400", payment: "bg-blue-500/10 text-blue-400" };

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerFilter, setCustomerFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customerId: "", orderId: "", type: "credit", amount: "", description: "", referenceNo: "" });

  const fetchEntries = async () => {
    const url = customerFilter ? `/api/admin/ledger?customerId=${customerFilter}` : "/api/admin/ledger";
    const res = await fetch(url);
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [customerFilter]);

  const handleAdd = async () => {
    if (!form.customerId || !form.amount || !form.description) return;
    const res = await fetch("/api/admin/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount), orderId: form.orderId || undefined }) });
    if (res.ok) { const data = await res.json(); setEntries(prev => [data.entry, ...prev]); setShowAdd(false); setForm({ customerId: "", orderId: "", type: "credit", amount: "", description: "", referenceNo: "" }); }
  };

  const totalCredit = entries.filter(e => e.type === "credit").reduce((sum, e) => sum + e.amount, 0);
  const totalDebit = entries.filter(e => e.type === "debit").reduce((sum, e) => sum + e.amount, 0);
  const totalPayment = entries.filter(e => e.type === "payment").reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = entries.length > 0 ? entries[0].balance : 0;

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Credit Ledger</h2>
        <div className="flex gap-3">
          <input type="number" placeholder="Filter by Customer ID" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="w-48 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
          <button onClick={() => setShowAdd(true)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">+ Add Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Current Balance</p><p className="mt-1 text-2xl font-bold text-orange-400">₹{currentBalance.toLocaleString("en-IN")}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Total Credit</p><p className="mt-1 text-2xl font-bold text-green-400">₹{totalCredit.toLocaleString("en-IN")}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Total Debit</p><p className="mt-1 text-2xl font-bold text-red-400">₹{totalDebit.toLocaleString("en-IN")}</p></div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5"><p className="text-sm text-gray-400">Payments Received</p><p className="mt-1 text-2xl font-bold text-blue-400">₹{totalPayment.toLocaleString("en-IN")}</p></div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {entries.length === 0 ? <div className="p-8 text-center text-gray-500">No ledger entries</div> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-gray-800 text-gray-400"><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Balance</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {entries.map(e => (
                <tr key={e.id} className="text-gray-300">
                  <td className="px-4 py-3 text-gray-400">{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">#{e.customerId}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[e.type] || TYPE_COLORS.credit}`}>{e.type}</span></td>
                  <td className="px-4 py-3 text-gray-400">{e.description}</td>
                  <td className={`px-4 py-3 font-medium ${e.type === "debit" ? "text-red-400" : "text-green-400"}`}>{e.type === "debit" ? "-" : "+"}₹{e.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium">₹{e.balance.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">Add Ledger Entry</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-300 mb-1">Customer ID *</label><input type="number" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Type *</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"><option value="credit">Credit (Give)</option><option value="debit">Debit (Receive)</option><option value="payment">Payment (Received)</option></select></div>
              <div><label className="block text-sm text-gray-300 mb-1">Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Description *</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Order #123 payment" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Order ID (optional)</label><input type="number" value={form.orderId} onChange={e => setForm({...form, orderId: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Reference No</label><input type="text" value={form.referenceNo} onChange={e => setForm({...form, referenceNo: e.target.value})} placeholder="e.g. UPI ref, cheque no" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700">Cancel</button>
                <button onClick={handleAdd} className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Add Entry</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
