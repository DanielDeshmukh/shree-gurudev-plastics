"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import {
  MdCheckCircle,
  MdShoppingCart,
  MdLocalShipping,
  MdInventory,
  MdDeliveryDining,
  MdHome,
  MdCancel,
  MdStore,
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
  phone: string;
  status: string;
  deliveryMethod: string;
  paymentMethod: string | null;
  paymentStatus: string;
  address: string | null;
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
  const { user, loading: authLoading } = useCustomerAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownershipError, setOwnershipError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    fetch(`/api/orders/track/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        // Ownership check: logged-in user's phone must match order's phone
        if (user) {
          const orderPhone = (data.phone || "").replace(/\s/g, "").replace(/^\+91/, "");
          const userPhone = (user.phone || "").replace(/\s/g, "").replace(/^\+91/, "");
          if (orderPhone && userPhone && orderPhone !== userPhone) {
            setOwnershipError(true);
            return;
          }
        }
        setOrder(data);
      })
      .catch(() => setError("Failed to load order details"))
      .finally(() => setLoading(false));
  }, [token, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (ownershipError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCancel className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">This order does not belong to you</h1>
          <p className="text-gray-500 text-sm">You can only track orders placed from your own account.</p>
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

  // Find current stage index
  const currentStageIndex = isCancelled
    ? -1
    : STAGES.findIndex((s) => s.key === order.status);

  // Get timeline lookup for timestamps
  const timelineMap: Record<string, string> = {};
  order.timeline.forEach((t) => {
    timelineMap[t.status] = t.timestamp;
  });

  // Calculate truck position (percentage along the path)
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
        {isCancelled && (
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
              {/* Track line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute top-5 left-0 h-1 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${truckProgress}%` }}
              />

              {/* Nodes */}
              <div className="relative flex justify-between">
                {STAGES.map((stage, i) => {
                  const isCompleted = completedStatuses.includes(stage.key);
                  const isCurrent = order.status === stage.key;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center" style={{ width: `${100 / STAGES.length}%` }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500 text-white shadow-md shadow-green-500/30"
                            : isCurrent
                              ? "bg-blue-500 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium ${
                        isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {stage.label}
                      </p>
                      {timelineMap[stage.key] && (
                        <p className="text-[10px] text-gray-400 mt-0.5 text-center">
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
                    {/* Node + Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                              ? "bg-blue-500 text-white ring-4 ring-blue-100"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-10 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                      )}
                    </div>

                    {/* Text */}
                    <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                      <p className={`text-sm font-medium ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                        {stage.label}
                      </p>
                      {timelineMap[stage.key] && (
                        <p className="text-xs text-gray-400">{formatDateTime(timelineMap[stage.key])}</p>
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
              {order.deliveryMethod === "pickup" ? (
                <p className="text-sm text-gray-500 mt-0.5">
                  {order.address || "Shree Gurudev Plastics, Bhayander (West), Maharashtra"}
                </p>
              ) : (
                order.address && (
                  <p className="text-sm text-gray-500 mt-0.5">{order.address}</p>
                )
              )}
              <p className="text-xs text-gray-400 mt-1">
                {order.deliveryMethod === "pickup"
                  ? "Ready for pickup after order confirmation"
                  : "Free delivery to your address"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Shree Gurudev Plastics | Tracking powered by secure link
          </p>
        </div>
      </div>
    </div>
  );
}
