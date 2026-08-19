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
  MdExpandMore,
  MdCheck,
  MdClose,
  MdDelete,
  MdFilterList,
  MdMarkEmailRead,
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Cancel dialog state
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: number | null; reason: string }>({
    open: false,
    orderId: null,
    reason: "",
  });

  // Process result state
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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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

  const markAsRead = async (ids: number[]) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids, read: true }),
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
        setProcessResult({
          open: true,
          orderId,
          success: false,
          message: data.error || "Failed to process",
          stockIssues: data.stockIssues,
        });
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

  const openWhatsApp = (url: string) => {
    window.open(url, "_blank");
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
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order": return <MdShoppingCart className="w-5 h-5 text-blue-400" />;
      case "success": return <MdCheckCircle className="w-5 h-5 text-green-400" />;
      case "warning": return <MdWarning className="w-5 h-5 text-yellow-400" />;
      case "error": return <MdError className="w-5 h-5 text-red-400" />;
      default: return <MdInfo className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MdNotificationsActive className="text-2xl text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected(new Set()); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
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
          {selected.size > 0 && (
            <>
              <button
                onClick={() => markAsRead(Array.from(selected))}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                Mark Read ({selected.size})
              </button>
              <button
                onClick={() => deleteNotifications(Array.from(selected))}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                Delete ({selected.size})
              </button>
            </>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => { if (confirm("Clear all notifications?")) deleteNotifications("all"); }}
              className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-sm hover:text-red-400 hover:bg-gray-700 transition-colors"
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
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
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

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-gray-900 rounded-xl border transition-colors ${
                !n.read ? "border-primary-500/30 bg-primary-500/5" : "border-gray-800"
              } ${selected.has(n.id) ? "ring-1 ring-primary-500" : ""}`}
            >
              <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => {
                  setExpandedId(expandedId === n.id ? null : n.id);
                  if (!n.read) markAsRead([n.id]);
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(n.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelect(n.id)}
                  className="w-4 h-4 mt-1 rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xl mt-0.5">{getTypeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${!n.read ? "text-white" : "text-gray-300"}`}>
                      {n.title}
                    </h3>
                    {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">{formatTime(n.createdAt)}</span>
                    {n.orderId && (
                      <span className="text-xs text-primary-400">Order #{n.orderId}</span>
                    )}
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-600 shrink-0 transition-transform ${expandedId === n.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded Card */}
              {expandedId === n.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                  <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{n.message}</p>

                  {n.orderId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcessOrder(n.orderId!)}
                        disabled={actionLoading === n.orderId}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === n.orderId ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Process Order
                      </button>
                      <button
                        onClick={() => setCancelDialog({ open: true, orderId: n.orderId, reason: "" })}
                        disabled={actionLoading === n.orderId}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </button>
                      <button
                        onClick={() => deleteNotifications([n.id])}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {!n.orderId && (
                    <button
                      onClick={() => deleteNotifications([n.id])}
                      className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Dialog */}
      {cancelDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-2">Cancel Order #{cancelDialog.orderId}?</h3>
            <p className="text-sm text-gray-400 mb-4">
              The customer will receive a WhatsApp message informing them of the cancellation.
            </p>
            <textarea
              value={cancelDialog.reason}
              onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelDialog({ open: false, orderId: null, reason: "" })}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelDialog.reason.trim() || actionLoading !== null}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading !== null ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process/Cancel Result Dialog */}
      {processResult.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${processResult.success ? "bg-green-500/20" : "bg-red-500/20"}`}>
              {processResult.success ? (
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">
              {processResult.success ? "Success" : "Issue Found"}
            </h3>
            <p className="text-sm text-gray-400 text-center mb-4">{processResult.message}</p>

            {processResult.stockIssues && processResult.stockIssues.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-red-400 mb-2">Stock Issues:</p>
                {processResult.stockIssues.map((issue, i) => (
                  <p key={i} className="text-xs text-red-300">• {issue}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {processResult.whatsappUrl && (
                <button
                  onClick={() => openWhatsApp(processResult.whatsappUrl!)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Send to Customer via WhatsApp
                </button>
              )}
              <button
                onClick={() => setProcessResult({ open: false, orderId: null, success: false, message: "" })}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
