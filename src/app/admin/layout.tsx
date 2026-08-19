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
  MdNotifications,
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

  useEffect(() => {
    if (pathname === "/admin/login") return;

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

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      <aside className="flex w-64 flex-col bg-gray-900 border-r border-gray-800">
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
                <Icon className="text-lg" />
                <span className="flex-1">{link.label}</span>
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

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            {pendingOrders > 0 && (
              <span className="text-xs text-red-400 font-medium">
                {pendingOrders} open order{pendingOrders !== 1 ? "s" : ""} awaiting action
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
