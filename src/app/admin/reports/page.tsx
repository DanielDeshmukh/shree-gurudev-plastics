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
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);

  const fetchReport = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (reportDate) params.set("from", reportDate);
    if (reportDate) params.set("to", reportDate);
    fetch(`/api/reports?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load report data"))
      .finally(() => setLoading(false));
  };

  const downloadExcel = async (type: "daily" | "monthly") => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ type });
      if (type === "daily") {
        if (reportDate) params.set("from", reportDate);
        if (reportDate) params.set("to", reportDate);
      } else {
        params.set("year", String(monthlyYear));
        params.set("month", String(monthlyMonth));
      }
      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "report.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download Excel report");
    }
    setDownloading(false);
  };

  const avgOrderValue =
    data && data.totalOrders > 0
      ? data.totalRevenue / data.totalOrders
      : 0;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sales Reports</h2>

      {/* Excel Download Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-3 text-lg font-semibold">Download Daily Report (Excel)</h3>
          <p className="mb-4 text-sm text-gray-400">Detailed order-by-order breakdown for a single day.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => downloadExcel("daily")}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-3 text-lg font-semibold">Download Monthly Report (Excel)</h3>
          <p className="mb-4 text-sm text-gray-400">Monthly summary with weekly breakdown, products, and customer analysis.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Month</label>
              <select
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Year</label>
              <select
                value={monthlyYear}
                onChange={(e) => setMonthlyYear(Number(e.target.value))}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => downloadExcel("monthly")}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* Online Report Section */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="mb-4 text-lg font-semibold">Online Report Viewer</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="rounded-lg bg-primary-500 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
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
              <p className="mt-1 text-2xl font-bold text-primary-400">
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
          Select a date range and click &quot;Generate Report&quot; to view sales data, or download an Excel report above.
        </div>
      )}
    </div>
  );
}
