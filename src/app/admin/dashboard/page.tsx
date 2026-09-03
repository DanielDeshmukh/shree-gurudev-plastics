"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  MdInventory, MdReceipt, MdTrendingUp, MdCategory, MdPeople, MdWarning,
} from "react-icons/md";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBrands: number;
  totalCustomers: number;
  lowStockCount: number;
  recentOrders: {
    id: number; publicId: string; customer: string; phone: string; total: number;
    status: string; createdAt: string;
    items: { product: { name: string }; quantity: number; price: number }[];
  }[];
  topProducts: { id: number; name: string; price: number; orderCount: number }[];
  revenueThisYear: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  monthlyRevenue12Months: { month: string; revenue: number }[];
  orderStatusData: { status: string; count: number }[];
  brandRevenueData: { name: string; revenue: number }[];
  revenueTimeline: { date: string; revenue: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#6B7280",
  confirmed: "#EAB308",
  shipped: "#3B82F6",
  arrived: "#8B5CF6",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

const BRAND_COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4", "#F59E0B", "#EC4899"];

const tooltipStyle = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#F3F4F6",
  fontSize: 13,
  itemStyle: { color: "#F3F4F6" },
  labelStyle: { color: "#9CA3AF" },
};

const statIcons = [MdInventory, MdReceipt, MdTrendingUp, MdCategory, MdPeople, MdWarning];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<{
    categoryData: { category: string; count: number }[];
    salesTimeline: { date: string; orders: number; revenue: number }[];
    topCustomers: { name: string; phone: string; totalOrders: number; totalSpent: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));

    fetch("/api/admin/analytics", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAnalytics({
        categoryData: d.categoryData || [],
        salesTimeline: d.salesTimeline || [],
        topCustomers: d.topCustomers || [],
      }))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
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
    { label: "Products", value: data.totalProducts, icon: MdInventory, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Orders", value: data.totalOrders, icon: MdReceipt, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Revenue", value: `₹${data.totalRevenue.toLocaleString("en-IN")}`, icon: MdTrendingUp, color: "text-primary-400", bg: "bg-primary-500/10" },
    { label: "Brands", value: data.totalBrands, icon: MdCategory, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Customers", value: data.totalCustomers, icon: MdPeople, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Low Stock", value: data.lowStockCount, icon: MdWarning, color: data.lowStockCount > 0 ? "text-red-400" : "text-green-400", bg: data.lowStockCount > 0 ? "bg-red-500/10" : "bg-green-500/10" },
  ];

  const chartData = (data.topProducts || []).filter((p: any) => p?.name).map((p: any) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
    Orders: p.orderCount,
  }));

  const revenueChange = data.revenueLastMonth > 0
    ? Math.round(((data.revenueThisMonth - data.revenueLastMonth) / data.revenueLastMonth) * 100)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard & Analytics</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => {
          const Icon = statIcons[i];
          return (
            <div key={stat.label} className="rounded-xl bg-gray-900 border border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 truncate">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-400">This Year ({new Date().getFullYear()})</p>
          <p className="mt-1 text-xl font-bold text-primary-400">₹{data.revenueThisYear.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-400">This Month</p>
          <p className="mt-1 text-xl font-bold text-green-400">₹{data.revenueThisMonth.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Last Month</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-xl font-bold text-blue-400">₹{data.revenueLastMonth.toLocaleString("en-IN")}</p>
            {revenueChange !== null && (
              <span className={`text-xs font-medium ${revenueChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {revenueChange >= 0 ? "+" : ""}{revenueChange}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 12-Month Revenue Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Revenue — Last 12 Months</h3>
        {data.monthlyRevenue12Months.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyRevenue12Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {data.monthlyRevenue12Months.map((entry, i) => (
                  <Cell key={i} fill={i === data.monthlyRevenue12Months.length - 1 ? "#F97316" : "#6366F1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
        )}
      </div>

      {/* Charts Row 1: Revenue Timeline + Order Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Revenue Trend (30 days)</h3>
          {data.revenueTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.revenueTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} dot={{ r: 3, fill: "#F97316" }} activeDot={{ r: 6, stroke: "#F97316", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Order Status</h3>
          {data.orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.orderStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                    label={({ status, count }) => `${status} (${count})`}
                >
                  {data.orderStatusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6B7280"} />
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

      {/* Charts Row 2: Top Products + Brand Revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Top Products</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} orders`, "Orders"]} />
                <Bar dataKey="Orders" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Revenue by Brand</h3>
          {data.brandRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.brandRevenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {data.brandRevenueData.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-20 text-center">No data yet</p>
          )}
        </div>
      </div>

      {/* Analytics: Sales Timeline + Category Pie */}
      {analytics && (analytics.salesTimeline.length > 0 || analytics.categoryData.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {analytics.salesTimeline.length > 0 && (
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Orders Timeline (30 days)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.salesTimeline}>
                  <defs>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [
                      value,
                      name === "orders" ? "Orders" : "Revenue",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} fill="url(#ordersGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {analytics.categoryData.length > 0 && (
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Orders by Category</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    label={({ category, count }) => `${category} (${count})`}
                  >
                    {analytics.categoryData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value} orders`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Analytics: Top Customers */}
      {analytics && analytics.topCustomers.length > 0 && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Top Customers</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.topCustomers.map((c, i) => (
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
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="pb-3 pr-4 font-medium">ID</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Phone</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="text-gray-300">
                  <td className="py-3 pr-4">#{order.publicId}</td>
                  <td className="py-3 pr-4 font-medium">{order.customer}</td>
                  <td className="py-3 pr-4 hidden sm:table-cell">{order.phone}</td>
                  <td className="py-3 pr-4">₹{order.total.toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === "delivered" ? "bg-green-500/10 text-green-400"
                        : order.status === "arrived" ? "bg-purple-500/10 text-purple-400"
                          : order.status === "shipped" ? "bg-blue-500/10 text-blue-400"
                            : order.status === "confirmed" ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-gray-500/10 text-gray-400"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 hidden md:table-cell">
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
