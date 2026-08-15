"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/brands", label: "Brands", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/invoices", label: "Invoices", icon: "📄" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
  { href: "/admin/analytics", label: "Analytics", icon: "📉" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/inventory", label: "Inventory", icon: "🔔" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/followup", label: "WhatsApp Follow-up", icon: "💬" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/admin/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      <aside className="flex w-64 flex-col bg-gray-900 border-r border-gray-800">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <span className="text-lg font-bold text-orange-500">Shree Gurudev</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-6">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
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
