"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  MdCheckCircle,
  MdShoppingCart,
  MdLocalShipping,
  MdInventory,
  MdDeliveryDining,
  MdHome,
  MdCancel,
  MdStore,
  MdClose,
} from "react-icons/md";

const STAGES = [
  { key: "Order Placed", icon: MdShoppingCart, label: "Order Placed" },
  { key: "Confirmed", icon: MdCheckCircle, label: "Confirmed" },
  { key: "Processing", icon: MdInventory, label: "Processing" },
  { key: "Shipped", icon: MdLocalShipping, label: "Shipped" },
  { key: "Out for Delivery", icon: MdDeliveryDining, label: "Out for Delivery" },
  { key: "Delivered", icon: MdHome, label: "Delivered" },
];

type TimelineEntry = {
  status: string;
  note: string | null;
  timestamp: string;
};

type OrderData = {
  orderId: string;
  customer: string;
  status: string;
  deliveryMethod: string;
  paymentMethod: string | null;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { name: string; color: string; brand: string; quantity: number; price: number }[];
  timeline: TimelineEntry[];
};

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function TrackOrderPage() {
  const routeParams = useParams();
  const token = routeParams.token as string;
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const fetchOrder = () =>
      fetch(`/api/orders/track/${token}`)
        .then((r) => r.json())
        .then((data) => {
          if (!active) return;
          if (data.error) {
            setError(data.error);
            return;
          }
          setOrder(data);
        })
        .catch(() => {
          if (active) setError("Failed to load order details");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [token]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/track/${token}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Customer requested cancellation" }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        setCancelSuccess(true);
        setOrder((prev) => prev ? { ...prev, status: "cancelled" } : prev);
      } else {
        const data = await res.json();
        toast(data.error || "Failed to cancel order", "error");
      }
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order && !["cancelled", "delivered"].includes(order.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCancel className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500">{error || "This tracking link is invalid or expired."}</p>
        </div>
      </div>
    );
  }

  const completedStatuses = order.timeline.map((t) => t.status);
  const isCancelled = order.status === "cancelled";

  const currentStageIndex = isCancelled
    ? -1
    : STAGES.findIndex((s) => s.key === order.status);

  const timelineMap: Record<string, string> = {};
  order.timeline.forEach((t) => {
    timelineMap[t.status] = t.timestamp;
  });

  const highestCompletedIdx = isCancelled
    ? -1
    : STAGES.reduce((max, stage, i) => {
        return completedStatuses.includes(stage.key) ? i : max;
      }, -1);

  for (let i = 0; i < highestCompletedIdx; i++) {
    const stage = STAGES[i];
    if (!timelineMap[stage.key]) {
      const nextCompleted = STAGES.slice(i + 1).find((s) => timelineMap[s.key]);
      if (nextCompleted) {
        timelineMap[stage.key] = timelineMap[nextCompleted.key];
        if (!completedStatuses.includes(stage.key)) {
          completedStatuses.push(stage.key);
        }
      }
    }
  }

  const truckProgress = isCancelled
    ? 0
    : currentStageIndex >= 0
      ? (currentStageIndex / (STAGES.length - 1)) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Track Your Order</h1>
              <p className="text-sm text-gray-500 mt-0.5">Order #{order.orderId}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-green-600 font-medium uppercase tracking-wide">Live - auto-updates</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                order.paymentStatus === "partial" ? "bg-blue-100 text-blue-700" :
                order.paymentStatus === "refunded" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {order.paymentStatus === "paid" ? "Paid" :
                 order.paymentStatus === "partial" ? "Partially Paid" :
                 order.paymentStatus === "refunded" ? "Refunded" : "Payment Pending"}
              </span>
              <p className="text-sm text-gray-500">Ordered on</p>
              <p className="text-sm font-medium text-gray-900">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Cancelled Banner */}
        {isCancelled && !cancelSuccess && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <MdCancel className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Order Cancelled</p>
              <p className="text-sm text-red-600">This order has been cancelled. Contact us for more details.</p>
            </div>
          </div>
        )}

        {/* Truck Progress */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden">
            <h2 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">Order Progress</h2>

            {/* Desktop: Horizontal */}
            <div className="hidden sm:block relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute top-5 left-0 h-1 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${truckProgress}%` }}
              />

              <div className="relative flex justify-between">
                {STAGES.map((stage, i) => {
                  const isCompleted = completedStatuses.includes(stage.key);
                  const isCurrent = order.status === stage.key;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center" style={{ width: `${100 / STAGES.length}%` }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-700 ease-out ${
                          isCompleted
                            ? "bg-green-500 text-white shadow-md shadow-green-500/30 scale-100"
                            : isCurrent
                              ? "bg-blue-500 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100 scale-110"
                              : "bg-gray-200 text-gray-400 scale-100"
                        }`}
                      >
                        <Icon className="w-5 h-5 transition-transform duration-500" />
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium transition-colors duration-500 ${
                        isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {stage.label}
                      </p>
                      {timelineMap[stage.key] && (
                        <p className="text-[10px] text-gray-400 mt-0.5 text-center transition-opacity duration-500">
                          {formatDateTime(timelineMap[stage.key])}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Vertical */}
            <div className="sm:hidden space-y-0">
              {STAGES.map((stage, i) => {
                const isCompleted = completedStatuses.includes(stage.key);
                const isCurrent = order.status === stage.key;
                const isLast = i === STAGES.length - 1;
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 transition-all duration-700 ease-out ${
                          isCompleted
                            ? "bg-green-500 text-white scale-100"
                            : isCurrent
                              ? "bg-blue-500 text-white ring-4 ring-blue-100 scale-110"
                              : "bg-gray-200 text-gray-400 scale-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 transition-transform duration-500" />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-10 transition-colors duration-700 ease-out ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                      )}
                    </div>

                    <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                      <p className={`text-sm font-medium transition-colors duration-500 ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                        {stage.label}
                      </p>
                      {timelineMap[stage.key] && (
                        <p className="text-xs text-gray-400 transition-opacity duration-500">{formatDateTime(timelineMap[stage.key])}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Order Items</h2>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.brand} | {item.color}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">x{item.quantity}</p>
                  <p className="text-xs text-gray-500">₹{item.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
            <p className="text-sm font-semibold text-gray-900">Total</p>
            <p className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {order.deliveryMethod === "pickup" ? "Pickup Details" : "Delivery To"}
          </h2>
          <div className="flex items-start gap-3">
            {order.deliveryMethod === "pickup" ? (
              <MdStore className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            ) : (
              <MdLocalShipping className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{order.customer}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {order.deliveryMethod === "pickup"
                  ? "Shree Gurudev Plastics, Bhayander (West)"
                  : "Delivery address on file"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {order.deliveryMethod === "pickup"
                  ? "Ready for pickup after order confirmation"
                  : "Free delivery to your address"}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Order Button */}
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 px-4 rounded-2xl transition-colors duration-200 text-sm"
          >
            Cancel Order
          </button>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Shree Gurudev Plastics | Tracking powered by secure link
          </p>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCancel className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel Order?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This action cannot be reversed. Your order will be cancelled and stock will be restored.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Success Message */}
      {cancelSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative text-center">
            <button
              onClick={() => setCancelSuccess(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCancel className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Cancelled</h3>
            <p className="text-sm text-gray-500 mb-1">
              We understand your concerns. Your order has been cancelled.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              You can still shop whenever you want — we&apos;ll always be open for you. Thank you!
            </p>
            <button
              onClick={() => setCancelSuccess(false)}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
