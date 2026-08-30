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
  MdCelebration,
  MdPaid,
  MdMenu,
  MdClose,
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
  { href: "/admin/festival", label: "Festival Settings", icon: MdCelebration },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: MdAutorenew },
  { href: "/admin/payments", label: "Payments", icon: MdPaid },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceEta, setMaintenanceEta] = useState("");
  const [showMaintenancePicker, setShowMaintenancePicker] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

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
      .catch(() => { showToast("Failed to load maintenance status", "error"); });

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
    setMaintenanceSaving(true);
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
        if (next) {
          const etaDate = d.eta ? new Date(d.eta) : null;
          const etaStr = etaDate
            ? etaDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
              " on " +
              etaDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
            : null;
          showToast(etaStr ? `Maintenance ON — back by ${etaStr}` : "Maintenance ON — no ETA set");
        } else {
          showToast("Site is back live!");
        }
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const saveEta = async () => {
    setMaintenanceSaving(true);
    const eta = maintenanceEta ? new Date(maintenanceEta).toISOString() : null;
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled: maintenanceMode, eta }),
      });
      if (res.ok) {
        const etaDate = eta ? new Date(eta) : null;
        const etaStr = etaDate
          ? etaDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
            " on " +
            etaDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : null;
        showToast(etaStr ? `ETA updated — back by ${etaStr}` : "ETA cleared");
        setTimeout(() => setShowMaintenancePicker(false), 1200);
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setMaintenanceSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-gray-900 border border-gray-700 text-orange-400"
              : "bg-gray-900 border border-red-800 text-red-400"
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-orange-500" : "bg-red-500"}`} />
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  maintenanceMode
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                    : "bg-green-500/10 text-green-400 border border-green-500/30"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${maintenanceMode ? "bg-red-500" : "bg-green-500"}`} />
                {maintenanceMode ? "MAINTENANCE" : "LIVE"}
              </button>
              {showMaintenancePicker && (
                <div className="fixed right-2 top-16 sm:absolute sm:right-0 sm:top-full sm:mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 w-[calc(100vw-1rem)] sm:w-80 max-w-80 overflow-hidden">
                  {/* Status banner */}
                  <div className={`px-4 py-3 ${maintenanceMode ? "bg-red-500/10 border-b border-red-500/20" : "bg-green-500/10 border-b border-green-500/20"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${maintenanceMode ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                        <span className={`text-sm font-bold ${maintenanceMode ? "text-red-400" : "text-green-400"}`}>
                          {maintenanceMode ? "SITE IS DOWN" : "SITE IS LIVE"}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowMaintenancePicker(false)}
                        className="p-1 text-gray-500 hover:text-gray-300"
                      >
                        <MdClose className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {maintenanceMode
                        ? "Visitors see the maintenance page"
                        : "All visitors can access the site"}
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Big toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Enable maintenance mode</span>
                      <button
                        onClick={() => toggleMaintenance()}
                        disabled={maintenanceSaving}
                        className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                          maintenanceMode ? "bg-red-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            maintenanceMode ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* ETA (only when ON) */}
                    {maintenanceMode && (
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5">Back online by (optional)</label>
                        <input
                          type="datetime-local"
                          value={maintenanceEta}
                          onChange={(e) => setMaintenanceEta(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                        />
                        {maintenanceEta && (
                          <button
                            onClick={saveEta}
                            disabled={maintenanceSaving}
                            className="mt-2 w-full bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                          >
                            {maintenanceSaving ? "Saving..." : "Save ETA"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Deploy gate */}
                    <div className="border-t border-gray-800 pt-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Deploy Gate</p>
                      <p className={`text-xs ${maintenanceMode ? "text-green-400" : "text-amber-400"}`}>
                        {maintenanceMode
                          ? "Deployments allowed"
                          : "Deployments blocked — turn on maintenance first"}
                      </p>
                    </div>
                  </div>
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
