"use client";

import { useState, useEffect } from "react";
import { MdRefresh, MdTrendingUp, MdWarning, MdError, MdPaid, MdSearch, MdUndo } from "react-icons/md";

interface Payment {
  id: number;
  orderId: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  description: string | null;
  createdAt: string;
  order: { id: number; publicId: string; customer: string; phone: string; total: number } | null;
}

interface Stats {
  totalCollected: number;
  totalPending: number;
  totalFailed: number;
  totalCount: number;
  capturedCount: number;
  pendingCount: number;
  failedCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  captured: "text-green-400 bg-green-500/10",
  created: "text-yellow-400 bg-yellow-500/10",
  failed: "text-red-400 bg-red-500/10",
  refunded: "text-purple-400 bg-purple-500/10",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [refunding, setRefunding] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/payments");
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefund = async (payment: Payment) => {
    if (!confirm(`Refund Rs.${(payment.amount / 100).toLocaleString("en-IN")} for ${payment.order?.customer || "this order"}?`)) return;
    setRefunding(payment.id);
    try {
      const res = await fetch("/api/razorpay/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.razorpayPaymentId, reason: "Admin refund" }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Refund failed");
      }
    } catch {
      alert("Refund failed");
    }
    setRefunding(null);
  };

  const fmt = (n: number) => `Rs.${(n / 100).toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filtered = payments.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        p.order?.customer?.toLowerCase().includes(q) ||
        p.order?.publicId?.toLowerCase().includes(q) ||
        p.razorpayPaymentId?.toLowerCase().includes(q) ||
        p.order?.phone?.includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
            <p className="text-sm text-gray-400">Razorpay payment tracking and refunds</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm">
            <MdRefresh size={16} /> Refresh
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><MdTrendingUp size={14} /> Collected</div>
              <div className="text-xl font-bold text-green-400">{fmt(stats.totalCollected)}</div>
              <div className="text-xs text-gray-500">{stats.capturedCount} payments</div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><MdPaid size={14} /> Pending</div>
              <div className="text-xl font-bold text-yellow-400">{fmt(stats.totalPending)}</div>
              <div className="text-xs text-gray-500">{stats.pendingCount} payments</div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><MdError size={14} /> Failed</div>
              <div className="text-xl font-bold text-red-400">{fmt(stats.totalFailed)}</div>
              <div className="text-xs text-gray-500">{stats.failedCount} payments</div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><MdWarning size={14} /> Total</div>
              <div className="text-xl font-bold text-white">{stats.totalCount}</div>
              <div className="text-xs text-gray-500">all transactions</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-2">
            {["all", "captured", "created", "failed", "refunded"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search customer, order, payment ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No payments found</div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Method</th>
                    <th className="text-left px-4 py-3">Payment ID</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-primary-400 font-medium">{p.order?.publicId || `#${p.orderId}`}</td>
                      <td className="px-4 py-3 text-white">{p.order?.customer || "-"}</td>
                      <td className="px-4 py-3 text-white font-medium">{fmt(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] || "text-gray-400 bg-gray-500/10"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs uppercase">{p.method || "-"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{p.razorpayPaymentId || "-"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        {p.status === "captured" && (
                          <button onClick={() => handleRefund(p)} disabled={refunding === p.id} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                            <MdUndo size={12} /> {refunding === p.id ? "..." : "Refund"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
