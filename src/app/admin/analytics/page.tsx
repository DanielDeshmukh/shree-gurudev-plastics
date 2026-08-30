"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { MdTrendingUp, MdTrendingDown, MdShoppingCart, MdPeople } from "react-icons/md";
import { useToast } from "@/components/Toast";

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

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4", "#F59E0B", "#EC4899"];

const tooltipStyle = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#F3F4F6",
  fontSize: 13,
};

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics", { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast("Failed to load analytics", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
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

  const stats = [
    { label: "Total Revenue", value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, color: "text-primary-400", bg: "bg-primary-500/10", icon: MdTrendingUp },
    { label: "Revenue (30d)", value: `₹${summary.revenueLast30Days.toLocaleString("en-IN")}`, color: "text-green-400", bg: "bg-green-500/10", icon: MdTrendingUp },
    { label: "Revenue (7d)", value: `₹${summary.revenueLast7Days.toLocaleString("en-IN")}`, color: "text-blue-400", bg: "bg-blue-500/10", icon: MdTrendingDown },
    { label: "Avg Order Value", value: `₹${Math.round(summary.avgOrderValue).toLocaleString("en-IN")}`, color: "text-purple-400", bg: "bg-purple-500/10", icon: MdShoppingCart },
    { label: "Total Orders", value: summary.totalOrders, color: "text-cyan-400", bg: "bg-cyan-500/10", icon: MdShoppingCart },
    { label: "Total Customers", value: summary.totalCustomers, color: "text-amber-400", bg: "bg-amber-500/10", icon: MdPeople },
  ];

  const topProductsBar = topProducts.slice(0, 8).map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    Revenue: p.revenue,
    Orders: p.count,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl bg-gray-900 border border-gray-800 p-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 truncate">{stat.label}</p>
                  <p className={`text-base font-bold ${stat.color} truncate`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Sales Timeline + Orders by Category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Sales Timeline (30 days)</h3>
          {salesTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesTimeline}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `₹${value.toLocaleString("en-IN")}` : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} fill="url(#revenueGrad)" />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Orders by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ category, count }) => `${category} (${count})`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value} orders`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>
      </div>

      {/* Charts Row 2: Top Products + Top Customers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Top Products by Revenue</h3>
          {topProductsBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsBar} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [
                  name === "Revenue" ? `₹${value.toLocaleString("en-IN")}` : value,
                  name,
                ]} />
                <Bar dataKey="Revenue" fill="#F97316" radius={[0, 4, 4, 0]}>
                  {topProductsBar.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Top Customers</h3>
          {topCustomers.length > 0 ? (
            <div className="space-y-2">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary-400">₹{c.totalSpent.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400">{c.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
