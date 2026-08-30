"use client";

import { useState, useEffect } from "react";
import { MdAutorenew, MdCheckCircle, MdCancel, MdPause, MdWarning, MdRefresh } from "react-icons/md";

interface Subscription {
  id: number;
  razorpaySubscriptionId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  amount: number;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextBillingDate: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  active: { color: "text-green-400 bg-green-500/10", icon: MdCheckCircle, label: "Active" },
  authenticated: { color: "text-blue-400 bg-blue-500/10", icon: MdAutorenew, label: "Authenticated" },
  created: { color: "text-yellow-400 bg-yellow-500/10", icon: MdAutorenew, label: "Pending" },
  paused: { color: "text-orange-400 bg-orange-500/10", icon: MdPause, label: "Paused" },
  cancelled: { color: "text-red-400 bg-red-500/10", icon: MdCancel, label: "Cancelled" },
  past_due: { color: "text-red-400 bg-red-500/10", icon: MdWarning, label: "Past Due" },
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/subscription", { credentials: "include" });
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const fmt = (n: number) => `Rs.${(n / 100).toLocaleString("en-IN")}`;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
            <p className="text-sm text-gray-400">Monthly maintenance autopay management</p>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <MdRefresh size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No subscriptions yet</div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Next Billing</th>
                    <th className="text-left px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.created;
                    const Icon = cfg.icon;
                    return (
                      <tr key={sub.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{sub.customerName || "-"}</td>
                        <td className="px-4 py-3 text-gray-300">{sub.customerPhone || "-"}</td>
                        <td className="px-4 py-3 text-gray-300">{fmt(sub.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon size={12} /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{fmtDate(sub.nextBillingDate)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(sub.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
