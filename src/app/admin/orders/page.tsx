"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; imageUrl: string | null };
}

interface Order {
  id: number;
  customer: string;
  phone: string;
  address: string | null;
  notes: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered"];

const statusStyles: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400",
  confirmed: "bg-yellow-500/10 text-yellow-400",
  shipped: "bg-blue-500/10 text-blue-400",
  delivered: "bg-green-500/10 text-green-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order?")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {}
  };

  const filtered = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-8 text-center text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900 text-gray-400">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="text-gray-300 hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3">#{order.id}</td>
                    <td className="px-4 py-3 font-medium">{order.customer}</td>
                    <td className="px-4 py-3">{order.phone}</td>
                    <td className="px-4 py-3">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium outline-none ${statusStyles[order.status] || statusStyles.pending} border-none cursor-pointer`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-expanded`}>
                      <td colSpan={7} className="bg-gray-900/50 px-4 py-4">
                        <div className="space-y-3">
                          {order.address && (
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-gray-300">Address:</span>{" "}
                              {order.address}
                            </p>
                          )}
                          {order.notes && (
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-gray-300">Notes:</span>{" "}
                              {order.notes}
                            </p>
                          )}
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-300">Items:</p>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-2.5"
                                >
                                  <div className="flex items-center gap-3">
                                    {item.product.imageUrl ? (
                                      <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-8 w-8 rounded object-cover"
                                      />
                                    ) : null}
                                    <span className="text-sm">{item.product.name}</span>
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {item.quantity} x ₹{item.price.toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
