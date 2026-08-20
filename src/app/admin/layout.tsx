"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MdDashboard,
  MdInventory,
  MdCategory,
  MdReceipt,
  MdDescription,
  MdTrendingUp,
  MdTrendingDown,
  MdStar,
  MdNotificationsActive,
  MdLock,
  MdAutorenew,
  MdFactory,
  MdAssignment,
  MdLocalShipping,
  MdAccountBalance,
  MdCardGiftcard,
  MdPeople,
  MdChat,
  MdCampaign,
  MdMenu,
  MdClose,
  MdBuild,
} from "react-icons/md";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
  { href: "/admin/products", label: "Products", icon: MdInventory },
  { href: "/admin/brands", label: "Brands", icon: MdCategory },
  { href: "/admin/orders", label: "Orders", icon: MdReceipt },
  { href: "/admin/notifications", label: "Notifications", icon: MdNotificationsActive, showBadge: true },
  { href: "/admin/invoices", label: "Invoices", icon: MdDescription },
  { href: "/admin/reports", label: "Reports", icon: MdTrendingUp },
  { href: "/admin/analytics", label: "Analytics", icon: MdTrendingDown },
  { href: "/admin/reviews", label: "Reviews", icon: MdStar },
  { href: "/admin/inventory", label: "Inventory", icon: MdInventory },
  { href: "/admin/price-lock", label: "Price Lock", icon: MdLock },
  { href: "/admin/recurring-orders", label: "Recurring Orders", icon: MdAutorenew },
  { href: "/admin/suppliers", label: "Suppliers", icon: MdFactory },
  { href: "/admin/purchase-orders", label: "Purchase Orders", icon: MdAssignment },
  { href: "/admin/delivery", label: "Delivery", icon: MdLocalShipping },
  { href: "/admin/ledger", label: "Credit Ledger", icon: MdAccountBalance },
  { href: "/admin/bundles", label: "Product Bundles", icon: MdCardGiftcard },
  { href: "/admin/customers", label: "Customers", icon: MdPeople },
  { href: "/admin/followup", label: "WhatsApp Follow-up", icon: MdChat },
  { href: "/admin/broadcast", label: "Festival Broadcast", icon: MdCampaign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceEta, setMaintenanceEta] = useState("");
  const [showMaintenancePicker, setShowMaintenancePicker] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    fetch("/api/maintenance", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setMaintenanceMode(d.enabled);
        if (d.eta) {
          const dt = new Date(d.eta);
          const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setMaintenanceEta(local);
        }
      })
      .catch(() => {});

    const fetchPending = async () => {
      try {
        const res = await fetch("/api/notifications?filter=unread", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPendingOrders(data.unreadCount || 0);
        }
      } catch {}
    };

    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const toggleMaintenance = async (forceState?: boolean) => {
    const next = forceState !== undefined ? forceState : !maintenanceMode;
    const eta = next && maintenanceEta ? new Date(maintenanceEta).toISOString() : null;
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled: next, eta }),
      });
      if (res.ok) {
        const d = await res.json();
        setMaintenanceMode(d.enabled);
      }
    } catch {}
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 lg:hidden">
          <span className="text-lg font-bold text-primary-500">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-800">
            <MdClose className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-500/10 text-primary-500"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <Icon className="text-lg shrink-0" />
                <span className="flex-1 truncate">{link.label}</span>
                {link.showBadge && pendingOrders > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                    {pendingOrders}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b border-gray-800 bg-gray-900 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-800 lg:hidden"
          >
            <MdMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">Admin Panel</h1>
            {pendingOrders > 0 && (
              <span className="text-xs text-red-400 font-medium hidden sm:inline">
                {pendingOrders} open order{pendingOrders !== 1 ? "s" : ""} awaiting action
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Maintenance toggle */}
            <div className="relative">
              <button
                onClick={() => setShowMaintenancePicker(!showMaintenancePicker)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  maintenanceMode
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                title={maintenanceMode ? "Maintenance ON" : "Maintenance OFF"}
              >
                <MdBuild className="w-4 h-4" />
              </button>
              {showMaintenancePicker && (
                <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl z-50 w-80">
                  <p className="text-xs text-gray-400 font-medium mb-3">Maintenance Mode</p>
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={() => toggleMaintenance()}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">
                      {maintenanceMode ? "Active — visitors see maintenance page" : "Off — site is live"}
                    </span>
                  </label>
                  {maintenanceMode && (
                    <>
                      <label className="text-xs text-gray-500 block mb-1">Estimated completion</label>
                      <input
                        type="datetime-local"
                        value={maintenanceEta}
                        onChange={(e) => setMaintenanceEta(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-primary-500"
                      />
                      <button
                        onClick={() => toggleMaintenance(true)}
                        className="w-full bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors mb-3"
                      >
                        Update ETA
                      </button>
                    </>
                  )}
                  {/* Deploy gate status */}
                  <div className={`border-t pt-3 mt-1 ${maintenanceMode ? "border-green-500/30" : "border-amber-500/30"}`}>
                    <p className="text-[10px] uppercase tracking-widest font-medium mb-1.5" style={{ color: maintenanceMode ? "#22c55e" : "#f59e0b" }}>
                      Deploy Gate
                    </p>
                    {maintenanceMode ? (
                      <p className="text-xs text-green-400">
                        Deployment allowed. Push to main to deploy.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400">
                        Deployment blocked. Enable maintenance before deploying.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowMaintenancePicker(false)}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-300"
                  >
                    <MdClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 transition-colors hover:bg-red-500/20 hover:text-red-400 shrink-0"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
