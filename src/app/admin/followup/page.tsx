"use client";

import { useEffect, useState } from "react";

interface Order {
  id: number;
  customer: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  items: { product: { name: string } }[];
}

const TEMPLATE_LABELS: Record<string, string> = {
  order_confirmation: "Order Confirmation",
  delivery_followup: "Delivery Follow-up",
  review_request: "Review Request",
  restock_alert: "Restock Alert",
};

const TEMPLATE_ICONS: Record<string, string> = {
  order_confirmation: "🎉",
  delivery_followup: "📦",
  review_request: "⭐",
  restock_alert: "📢",
};

export default function FollowupPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("order_confirmation");
  const [customMessage, setCustomMessage] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/followup")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedOrder) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          template: selectedTemplate,
          customMessage: customMessage || undefined,
        }),
      });
      const data = await res.json();
      if (data.whatsappUrl) {
        setGeneratedUrl(data.whatsappUrl);
        setPreviewMessage(data.message);
      }
    } catch {}
    setSending(false);
  };

  const handleSend = () => {
    if (generatedUrl) {
      window.open(generatedUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">WhatsApp Follow-up</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="mb-4 text-lg font-semibold">Select Order</h3>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order);
                  setGeneratedUrl("");
                  setPreviewMessage("");
                }}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  selectedOrder?.id === order.id
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">#{order.id}</p>
                    <p className="text-xs text-gray-400">₹{order.total.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="mb-4 text-lg font-semibold">Message Template</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTemplate(key);
                    setCustomMessage("");
                    setGeneratedUrl("");
                    setPreviewMessage("");
                  }}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedTemplate === key
                      ? "border-orange-500 bg-orange-500/10 text-orange-400"
                      : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <span className="mr-1">{TEMPLATE_ICONS[key]}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Or write a custom message:
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setGeneratedUrl("");
                  setPreviewMessage("");
                }}
                rows={3}
                placeholder="Type your custom WhatsApp message..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="mb-4 text-lg font-semibold">Preview & Send</h3>
            {selectedOrder ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  To: <span className="font-medium text-white">{selectedOrder.customer}</span>{" "}
                  ({selectedOrder.phone})
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={sending}
                  className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {sending ? "Generating..." : "Generate Message"}
                </button>
                {previewMessage && (
                  <div className="rounded-lg bg-gray-800 p-4">
                    <p className="whitespace-pre-wrap text-sm text-gray-300">{previewMessage}</p>
                  </div>
                )}
                {generatedUrl && (
                  <button
                    onClick={handleSend}
                    className="w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                  >
                    Open in WhatsApp
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an order to continue</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
