"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { MdStore, MdLocalShipping, MdCheckCircle, MdArrowBack, MdPayment, MdAccountBalance, MdCreditCard, MdMoney } from "react-icons/md";
import { PHONE } from "@/lib/seo";

const DELIVERY_AREAS = [
  "Bhayander",
  "Naigaon",
  "Vasai",
  "Virar",
  "Mumbai",
  "Thane",
  "Palghar",
  "Other",
];

const STORE_ADDRESS = "Shree Gurudev Plastics, Bhayander (West), Maharashtra";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    deliveryMethod: "delivery" as "pickup" | "delivery",
    paymentMethod: "cod" as "cod" | "upi" | "card" | "bank_transfer" | "other",
    address: "",
    area: "Bhayander",
    notes: "",
  });

  const isDelivery = form.deliveryMethod === "delivery";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    if (form.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (isDelivery && !form.address.trim()) {
      setError("Delivery address is required for home delivery");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fullAddress = isDelivery
        ? `${form.address}, ${form.area}`
        : STORE_ADDRESS;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form.name.trim(),
          phone: form.phone.trim(),
          deliveryMethod: form.deliveryMethod,
          paymentMethod: form.paymentMethod,
          address: fullAddress,
          notes: form.notes.trim() || null,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const data = await res.json();
      setPublicId(data.order.publicId);
      setTrackingToken(data.order.trackingToken);
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-2">
            Your order <span className="font-semibold text-primary-500">#{publicId}</span> has been received.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            {isDelivery
              ? "We will deliver to your address shortly."
              : "Your order is ready for pickup at our Bhayander store."}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            We&apos;ll confirm your order via WhatsApp shortly.
          </p>
          {trackingToken && (
            <a
              href={`/track/${trackingToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 font-medium mb-4"
            >
              <MdCheckCircle className="w-4 h-4" />
              Track Your Order
            </a>
          )}
          <p className="text-gray-500 text-sm mb-6">
            Or call us at{" "}
            <a href={`tel:+${PHONE}`} className="text-primary-500 font-medium">
              +91 85520 84251
            </a>
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/products"
              className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Continue Shopping
            </Link>
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Namaste!\n\nI have just placed order #" + publicId + ". Kindly confirm the order and share the expected delivery date." + (trackingToken ? "\n\nYou can track your order here: " + (process.env.NEXT_PUBLIC_SITE_URL || "https://shreegurudevplastics.com") + "/track/" + trackingToken : "") + "\n\nThank you!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Confirm on WhatsApp
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Add some products before checking out.</p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors"
        >
          <MdArrowBack className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

              {/* Delivery Method Toggle */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">How would you like to receive your order?</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, deliveryMethod: "pickup" })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      form.deliveryMethod === "pickup"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <MdStore className={`w-6 h-6 shrink-0 ${
                      form.deliveryMethod === "pickup" ? "text-primary-500" : "text-gray-400"
                    }`} />
                    <div className="text-left">
                      <p className={`font-semibold ${
                        form.deliveryMethod === "pickup" ? "text-primary-700" : "text-gray-900"
                      }`}>Store Pickup</p>
                      <p className="text-xs text-gray-500">Pick up from Bhayander</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, deliveryMethod: "delivery" })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      form.deliveryMethod === "delivery"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <MdLocalShipping className={`w-6 h-6 shrink-0 ${
                      form.deliveryMethod === "delivery" ? "text-primary-500" : "text-gray-400"
                    }`} />
                    <div className="text-left">
                      <p className={`font-semibold ${
                        form.deliveryMethod === "delivery" ? "text-primary-700" : "text-gray-900"
                      }`}>Home Delivery</p>
                      <p className="text-xs text-gray-500">Delivered to your door</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pickup Info Card */}
              {form.deliveryMethod === "pickup" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <MdStore className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Pickup Location</p>
                      <p className="text-sm text-blue-700">{STORE_ADDRESS}</p>
                      <p className="text-xs text-blue-600 mt-1">Free — Ready after order confirmation</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">How would you like to pay?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: "cod" as const, icon: MdMoney, label: "Cash on Delivery", desc: "Pay at delivery" },
                    { key: "upi" as const, icon: MdPayment, label: "UPI", desc: "GPay, PhonePe, etc." },
                    { key: "card" as const, icon: MdCreditCard, label: "Card", desc: "Debit / Credit" },
                    { key: "bank_transfer" as const, icon: MdAccountBalance, label: "Bank Transfer", desc: "NEFT / RTGS / IMPS" },
                  ].map(({ key, icon: Icon, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: key })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                        form.paymentMethod === key
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${form.paymentMethod === key ? "text-primary-500" : "text-gray-400"}`} />
                      <span className={`text-xs font-semibold ${form.paymentMethod === key ? "text-primary-700" : "text-gray-900"}`}>{label}</span>
                      <span className="text-[10px] text-gray-500">{desc}</span>
                    </button>
                  ))}
                </div>
                {form.paymentMethod === "upi" && (
                  <p className="text-xs text-gray-500 mt-2">Our UPI ID will be shared after order confirmation. You can pay via any UPI app.</p>
                )}
                {form.paymentMethod === "bank_transfer" && (
                  <p className="text-xs text-gray-500 mt-2">Bank details will be shared after order confirmation via WhatsApp.</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-900">Your Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Delivery Address — only shown for home delivery */}
              {isDelivery && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Street address, landmark"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Area *</label>
                    <select
                      required
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                    >
                      {DELIVERY_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Order..." : `Place Order — ₹${totalPrice.toLocaleString("en-IN")}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <BlurImage src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.brand && <span>{item.brand} · </span>}
                        {item.color && <span>{item.color} · </span>}
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({items.length} items)</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    {isDelivery ? (
                      <MdLocalShipping className="w-4 h-4" />
                    ) : (
                      <MdStore className="w-4 h-4" />
                    )}
                    {isDelivery ? "Delivery" : "Pickup"}
                  </span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-primary-500">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/products"
                className="block text-center text-sm text-primary-500 hover:underline mt-4"
              >
                <MdArrowBack className="w-4 h-4 inline mr-1" />
                Add more products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
