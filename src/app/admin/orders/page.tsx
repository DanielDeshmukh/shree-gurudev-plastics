"use client";

import { useEffect, useState } from "react";
import { MdStore, MdLocalShipping, MdContentCopy, MdChat, MdPrint } from "react-icons/md";
import { SITE_URL } from "@/lib/seo";
import ThermalReceiptModal from "@/components/ThermalReceiptModal";
import { useToast } from "@/components/Toast";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; imageUrl: string | null };
}

interface Order {
  id: number;
  publicId: string;
  customer: string;
  phone: string;
  address: string | null;
  deliveryMethod: string;
  paymentMethod: string | null;
  paymentStatus: string;
  paymentNote: string | null;
  notes: string | null;
  total: number;
  status: string;
  trackingToken: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusOptions = ["pending", "confirmed", "shipped", "arrived", "delivered"];

const statusStyles: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400",
  confirmed: "bg-yellow-500/10 text-yellow-400",
  shipped: "bg-blue-500/10 text-blue-400",
  arrived: "bg-purple-500/10 text-purple-400",
  delivered: "bg-green-500/10 text-green-400",
};

const paymentStatusStyles: Record<string, string> = {
  unpaid: "bg-amber-500/10 text-amber-400",
  paid: "bg-green-500/10 text-green-400",
  partial: "bg-blue-500/10 text-blue-400",
  refunded: "bg-red-500/10 text-red-400",
};

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order?")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {}
  };

  const handleGenerateInvoice = async (order: Order) => {
    try {
      const items = order.items.map((item) => ({
        productName: item.product.name,
        hsnCode: "3924",
        quantity: item.quantity,
        unitPrice: item.price,
        gstRate: 18,
      }));
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customer,
          customerPhone: order.phone,
          customerAddress: order.address,
          placeOfSupply: "Maharashtra",
          items,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const invoiceId = data.invoice?.id;
        if (invoiceId) setPrintInvoiceId(invoiceId);
      }
    } catch {}
  };

  const handleNotifyArrival = async (order: Order) => {
    try {
      const res = await fetch("/api/admin/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, template: "arrival_notification" }),
      });
      const data = await res.json();
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
    } catch {}
  };

  const handlePaymentUpdate = async (orderId: number, paymentStatus: string, paymentNote?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus, paymentNote: paymentNote || undefined }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus, paymentNote: paymentNote || o.paymentNote } : o))
        );
      }
    } catch {}
  };

  const handlePrintInvoice = async (order: Order) => {
    try {
      const res = await fetch("/api/admin/invoices");
      const data = await res.json();
      const inv = (data.invoices || []).find((i: { orderId: number }) => i.orderId === order.id);
      if (inv) {
        setPrintInvoiceId(inv.id);
      } else {
        await handleGenerateInvoice(order);
      }
    } catch {
      showToast("Failed to load invoice", "error");
    }
  };

  const getTrackingUrl = (token: string) => `${SITE_URL}/track/${token}`;

  const handleCopyLink = async (order: Order) => {
    if (!order.trackingToken) return;
    const url = getTrackingUrl(order.trackingToken);
    try {
      await navigator.clipboard.writeText(url);
      toast("Tracking link copied!", "success");
    } catch {
      toast("Failed to copy link", "error");
    }
  };

  const handleShareWhatsApp = (order: Order) => {
    if (!order.trackingToken) return;
    const url = getTrackingUrl(order.trackingToken);
    const msg = `Hi ${order.customer}!\n\nYour order #${order.publicId} has been confirmed.\nTotal: \u20B9${order.total.toLocaleString("en-IN")}\n\nTrack your order here: ${url}\n\nThank you for shopping with Shree Gurudev Plastics!`;
    window.open(`https://wa.me/91${order.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-8 text-center text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900 text-gray-400">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Delivery</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="text-gray-300 hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3">#{order.publicId}</td>
                    <td className="px-4 py-3 font-medium">{order.customer}</td>
                    <td className="px-4 py-3">{order.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.deliveryMethod === "pickup"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-green-500/10 text-green-400"
                      }`}>
                        {order.deliveryMethod === "pickup" ? (
                          <MdStore className="w-3 h-3" />
                        ) : (
                          <MdLocalShipping className="w-3 h-3" />
                        )}
                        {order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusStyles[order.paymentStatus] || paymentStatusStyles.unpaid}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">{paymentMethodLabels[order.paymentMethod || "cod"]}</span>
                    </td>
                    <td className="px-4 py-3">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium outline-none ${statusStyles[order.status] || statusStyles.pending} border-none cursor-pointer`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {order.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handlePaymentUpdate(order.id, "paid")}
                            className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        {order.status === "arrived" && (
                          <button
                            onClick={() => handleNotifyArrival(order)}
                            className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
                          >
                            Notify
                          </button>
                        )}
                        <button
                          onClick={() => handleGenerateInvoice(order)}
                          className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          Invoice
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-1"
                        >
                          <MdPrint size={12} /> Print
                        </button>
                        {order.trackingToken && (
                          <>
                            <button
                              onClick={() => handleCopyLink(order)}
                              className="rounded-lg bg-gray-500/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-500/20 transition-colors"
                              title="Copy tracking link"
                            >
                              <MdContentCopy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleShareWhatsApp(order)}
                              className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                              title="Share via WhatsApp"
                            >
                              <MdChat className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-expanded`}>
                      <td colSpan={9} className="bg-gray-900/50 px-4 py-4">
                        <div className="space-y-3">
                          <p className="text-sm text-gray-400">
                            <span className="font-medium text-gray-300">Delivery Method:</span>{" "}
                            <span className="inline-flex items-center gap-1">
                              {order.deliveryMethod === "pickup" ? (
                                <><MdStore className="w-3 h-3" /> Store Pickup</>
                              ) : (
                                <><MdLocalShipping className="w-3 h-3" /> Home Delivery</>
                              )}
                            </span>
                          </p>
                          {order.address && (
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-gray-300">Address:</span>{" "}
                              {order.address}
                            </p>
                          )}
                          {order.notes && (
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-gray-300">Notes:</span>{" "}
                              {order.notes}
                            </p>
                          )}
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-300">Items:</p>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-2.5"
                                >
                                  <div className="flex items-center gap-3">
                                    {item.product.imageUrl ? (
                                      <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-8 w-8 rounded object-cover"
                                      />
                                    ) : null}
                                    <span className="text-sm">{item.product.name}</span>
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {item.quantity} x ₹{item.price.toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {printInvoiceId && (
        <ThermalReceiptModal invoiceId={printInvoiceId} onClose={() => setPrintInvoiceId(null)} />
      )}
    </div>
  );
}
