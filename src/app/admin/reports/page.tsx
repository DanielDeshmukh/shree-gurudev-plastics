"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  date: string;
  orders: number;
  revenue: number;
}

interface ReportResponse {
  sales: SalesData[];
  totalRevenue: number;
  totalOrders: number;
}

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/reports?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load report data"))
      .finally(() => setLoading(false));
  };

  const avgOrderValue =
    data && data.totalOrders > 0
      ? data.totalRevenue / data.totalOrders
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sales Reports</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">
                ₹{data.totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{data.totalOrders}</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <p className="text-sm text-gray-400">Avg Order Value</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">
                ₹{avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <h3 className="mb-4 text-lg font-semibold">Revenue Over Time</h3>
              {data.sales.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F97316"
                      strokeWidth={2}
                      dot={{ fill: "#F97316", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No data</p>
              )}
            </div>

            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <h3 className="mb-4 text-lg font-semibold">Orders Over Time</h3>
              {data.sales.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                    />
                    <Bar dataKey="orders" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No data</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="mb-4 text-lg font-semibold">Daily Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Orders</th>
                    <th className="pb-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.sales.map((row) => (
                    <tr key={row.date} className="text-gray-300">
                      <td className="py-3 pr-4">
                        {new Date(row.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4">{row.orders}</td>
                      <td className="py-3">₹{row.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-8 text-center text-gray-400">
          Select a date range and click &quot;Generate Report&quot; to view sales data
        </div>
      )}
    </div>
  );
}
