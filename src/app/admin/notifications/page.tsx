"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MdNotifications,
  MdNotificationsActive,
  MdShoppingCart,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
  MdChevronRight,
  MdMarkEmailRead,
  MdDelete,
  MdArrowBack,
} from "react-icons/md";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  orderId: number | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: number | null; reason: string }>({
    open: false,
    orderId: null,
    reason: "",
  });

  const [processResult, setProcessResult] = useState<{ open: boolean; orderId: number | null; success: boolean; message: string; whatsappUrl?: string; stockIssues?: string[] }>({
    open: false,
    orderId: null,
    success: false,
    message: "",
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?filter=${filter}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [filter]);

  const markAsRead = useCallback(async (ids: number[]) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids, read: true }),
    });
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (activeId === null) return;
    const notification = notifications.find((n) => n.id === activeId);
    if (!notification || notification.read) return;
    const timer = setTimeout(() => {
      markAsRead([activeId]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeId, notifications, markAsRead]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n.id)));
    }
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids: "all", read: true }),
    });
    fetchNotifications();
  };

  const deleteNotifications = async (ids: number[] | "all") => {
    const query = ids === "all" ? "ids=all" : `ids=${ids.join(",")}`;
    await fetch(`/api/notifications?${query}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSelected(new Set());
    if (ids === "all") setActiveId(null);
    fetchNotifications();
  };

  const handleProcessOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "process" }),
      });
      const data = await res.json();
      if (res.ok) {
        setProcessResult({ open: true, orderId, success: true, message: data.message, whatsappUrl: data.whatsappUrl });
        fetchNotifications();
      } else {
        setProcessResult({ open: true, orderId, success: false, message: data.error || "Failed to process", stockIssues: data.stockIssues });
      }
    } catch {
      setProcessResult({ open: true, orderId, success: false, message: "Network error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelDialog.orderId) return;
    setActionLoading(cancelDialog.orderId);
    try {
      const res = await fetch(`/api/orders/${cancelDialog.orderId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "cancel", reason: cancelDialog.reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setProcessResult({ open: true, orderId: cancelDialog.orderId, success: true, message: data.message, whatsappUrl: data.whatsappUrl });
        setCancelDialog({ open: false, orderId: null, reason: "" });
        fetchNotifications();
      }
    } catch {
      setProcessResult({ open: true, orderId: cancelDialog.orderId, success: false, message: "Network error" });
    } finally {
      setActionLoading(null);
    }
  };

  const openWhatsApp = (url: string) => window.open(url, "_blank");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "order":
        return { icon: MdShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10", label: "Order" };
      case "success":
        return { icon: MdCheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Success" };
      case "warning":
        return { icon: MdWarning, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Warning" };
      case "error":
        return { icon: MdError, color: "text-red-500", bg: "bg-red-500/10", label: "Critical" };
      default:
        return { icon: MdInfo, color: "text-gray-400", bg: "bg-gray-500/10", label: "Info" };
    }
  };

  const activeNotification = notifications.find((n) => n.id === activeId);

  // Detail view
  if (activeNotification) {
    const config = getTypeConfig(activeNotification.type);
    const Icon = config.icon;
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setActiveId(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <MdArrowBack className="w-4 h-4" />
          Back to notifications
        </button>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-5 border-b border-gray-800`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  {activeNotification.orderId && (
                    <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                      Order #{activeNotification.orderId}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-white">{activeNotification.title}</h1>
                <p className="text-xs text-gray-500 mt-1">{formatDate(activeNotification.createdAt)} at {new Date(activeNotification.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{activeNotification.message}</p>
          </div>

          {/* Actions */}
          {activeNotification.orderId && (
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/30">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Actions</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleProcessOrder(activeNotification.orderId!)}
                  disabled={actionLoading === activeNotification.orderId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === activeNotification.orderId ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <MdCheckCircle className="w-4 h-4" />
                  )}
                  Process Order
                </button>
                <button
                  onClick={() => setCancelDialog({ open: true, orderId: activeNotification.orderId, reason: "" })}
                  disabled={actionLoading === activeNotification.orderId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <MdError className="w-4 h-4" />
                  Cancel Order
                </button>
                <button
                  onClick={() => { deleteNotifications([activeNotification.id]); setActiveId(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <MdDelete className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {!activeNotification.orderId && (
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/30">
              <button
                onClick={() => { deleteNotifications([activeNotification.id]); setActiveId(null); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
              >
                <MdDelete className="w-4 h-4" />
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Cancel Dialog */}
        {cancelDialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-2">Cancel Order #{cancelDialog.orderId}?</h3>
              <p className="text-sm text-gray-400 mb-4">The customer will receive a WhatsApp message informing them of the cancellation.</p>
              <textarea
                value={cancelDialog.reason}
                onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
                placeholder="Reason for cancellation..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setCancelDialog({ open: false, orderId: null, reason: "" })} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">Go Back</button>
                <button onClick={handleCancelOrder} disabled={!cancelDialog.reason.trim() || actionLoading !== null} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                  {actionLoading !== null ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Dialog */}
        {processResult.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${processResult.success ? "bg-green-500/20" : "bg-red-500/20"}`}>
                {processResult.success ? <MdCheckCircle className="w-6 h-6 text-green-400" /> : <MdError className="w-6 h-6 text-red-400" />}
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">{processResult.success ? "Success" : "Issue Found"}</h3>
              <p className="text-sm text-gray-400 text-center mb-4">{processResult.message}</p>
              {processResult.stockIssues && processResult.stockIssues.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-red-400 mb-2">Stock Issues:</p>
                  {processResult.stockIssues.map((issue, i) => <p key={i} className="text-xs text-red-300">- {issue}</p>)}
                </div>
              )}
              <div className="flex gap-3 justify-center">
                {processResult.whatsappUrl && (
                  <button onClick={() => openWhatsApp(processResult.whatsappUrl!)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">Send via WhatsApp</button>
                )}
                <button onClick={() => setProcessResult({ open: false, orderId: null, success: false, message: "" })} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MdNotificationsActive className="text-2xl text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} unread</span>
          )}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected(new Set()); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-sm hover:text-green-400 hover:bg-gray-700 transition-colors"
            >
              <MdMarkEmailRead className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          {selected.size > 0 && (
            <button
              onClick={() => deleteNotifications(Array.from(selected))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
            >
              <MdDelete className="w-4 h-4" />
              Delete ({selected.size})
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => { if (confirm("Clear all notifications?")) deleteNotifications("all"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-sm hover:text-red-400 hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl">
          <MdNotifications className="text-5xl text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications</p>
          <p className="text-gray-600 text-sm mt-1">New orders and updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-3 px-3 py-2">
            <input
              type="checkbox"
              checked={selected.size === notifications.length && notifications.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-xs text-gray-500">
              {selected.size > 0 ? `${selected.size} selected` : `${notifications.length} notifications`}
            </span>
          </div>

          {notifications.map((n) => {
            const config = getTypeConfig(n.type);
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                onClick={() => {
                  setActiveId(n.id);
                }}
                className={`bg-gray-900 rounded-xl border transition-all cursor-pointer hover:bg-gray-800/50 ${
                  !n.read ? "border-primary-500/40" : "border-gray-800"
                } ${selected.has(n.id) ? "ring-1 ring-primary-500" : ""}`}
              >
                <div className="flex items-center gap-4 p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(n.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(n.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500 shrink-0"
                  />

                  <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${!n.read ? "text-white" : "text-gray-300"} line-clamp-1`}>
                      {n.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                    <span className={`text-[10px] font-medium ${config.color} mt-1 inline-block`}>{config.label}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">{formatDate(n.createdAt)}</p>
                    {!n.read && <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-1" />}
                  </div>

                  <MdChevronRight className="w-5 h-5 text-gray-600 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
