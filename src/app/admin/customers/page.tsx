"use client";

import { useEffect, useState } from "react";
import { TIER_LABELS, type CustomerTier } from "@/lib/pricing";
import { useToast } from "@/components/Toast";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  tier: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
  orders: { id: number; total: number; status: string; createdAt: string }[];
}

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch(() => { toast("Failed to load customers", "error"); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const handleTierChange = async (customerId: number, newTier: string) => {
    await fetch(`/api/admin/customers/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tier: newTier }),
    });
    setCustomers((prev) => prev.map((c) => c.id === customerId ? { ...c, tier: newTier } : c));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Database</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Total Customers</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">{customers.length}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-primary-400">₹{totalSpent.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Repeat Customers</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {customers.filter((c) => c.totalOrders > 1).length}
          </p>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500 sm:max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <p className="text-lg text-gray-400">No customers yet</p>
          <p className="mt-1 text-sm text-gray-500">Customers will appear here after orders are placed.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((customer) => (
                <tr key={customer.id} className="text-gray-300">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      {customer.email && (
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <select
                      value={customer.tier}
                      onChange={(e) => handleTierChange(customer.id, e.target.value)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium outline-none border-none cursor-pointer ${
                        customer.tier === "bulk" ? "bg-purple-500/10 text-purple-400" :
                        customer.tier === "distributor" ? "bg-blue-500/10 text-blue-400" :
                        customer.tier === "dealer" ? "bg-green-500/10 text-green-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {(Object.keys(TIER_LABELS) as CustomerTier[]).map((t) => (
                        <option key={t} value={t}>{TIER_LABELS[t]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ₹{customer.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
