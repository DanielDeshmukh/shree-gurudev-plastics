"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalRevenue: number;
    avgOrderValue: number;
    revenueLast30Days: number;
    revenueLast7Days: number;
  };
  topProducts: { name: string; count: number; revenue: number }[];
  categoryData: { category: string; count: number }[];
  salesTimeline: { date: string; orders: number; revenue: number }[];
  topCustomers: { name: string; phone: string; totalOrders: number; totalSpent: number }[];
}

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#f59e0b", "#ec4899"];

const chartTooltipStyle = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#F3F4F6",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg bg-red-500/10 p-6 text-center text-red-400 border border-red-500/20">
        Failed to load analytics data
      </div>
    );
  }

  const { summary, topProducts, categoryData, salesTimeline, topCustomers } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-orange-400">₹{summary.totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Revenue (30d)</p>
          <p className="mt-1 text-2xl font-bold text-green-400">₹{summary.revenueLast30Days.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Revenue (7d)</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">₹{summary.revenueLast7Days.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Avg Order Value</p>
          <p className="mt-1 text-2xl font-bold text-purple-400">₹{Math.round(summary.avgOrderValue).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Sales Timeline (30 days)</h3>
          {salesTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No data yet</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Orders by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, count }) => `${category} (${count})`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Top Products by Revenue</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="revenue" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No data yet</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Top Customers</h3>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-400">₹{c.totalSpent.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400">{c.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
