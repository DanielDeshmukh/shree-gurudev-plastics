"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBrands: number;
  lowStockCount: number;
  recentOrders: {
    id: number;
    customer: string;
    phone: string;
    total: number;
    status: string;
    createdAt: string;
    items: { product: { name: string }; quantity: number; price: number }[];
  }[];
  topProducts: {
    id: number;
    name: string;
    price: number;
    orderCount: number;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-500/10 p-6 text-center text-red-400 border border-red-500/20">
        {error || "No data available"}
      </div>
    );
  }

  const stats = [
    { label: "Total Products", value: data.totalProducts, color: "text-blue-400" },
    { label: "Total Orders", value: data.totalOrders, color: "text-green-400" },
    {
      label: "Total Revenue",
      value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,
      color: "text-orange-400",
    },
    { label: "Total Brands", value: data.totalBrands, color: "text-purple-400" },
    { label: "Low Stock Alerts", value: data.lowStockCount, color: data.lowStockCount > 0 ? "text-red-400" : "text-green-400" },
  ];

  const chartData = data.topProducts.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    orders: p.orderCount,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-gray-900 border border-gray-800 p-5"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Top Products</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Bar dataKey="orders" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No data</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Top Products List</h3>
          <div className="space-y-3">
            {data.topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-400">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                  {product.orderCount} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="mb-4 text-lg font-semibold">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="pb-3 pr-4 font-medium">ID</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Phone</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="text-gray-300">
                  <td className="py-3 pr-4">#{order.id}</td>
                  <td className="py-3 pr-4">{order.customer}</td>
                  <td className="py-3 pr-4">{order.phone}</td>
                  <td className="py-3 pr-4">₹{order.total.toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-500/10 text-green-400"
                          : order.status === "shipped"
                            ? "bg-blue-500/10 text-blue-400"
                            : order.status === "confirmed"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
