"use client";

import { useState } from "react";
import { MdAutorenew, MdCheckCircle, MdError } from "react-icons/md";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionCard() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!name.trim() || !phone.trim()) {
      setMessage("Name and phone are required");
      setStatus("error");
      return;
    }
    if (phone.length < 10) {
      setMessage("Enter a valid 10-digit phone number");
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name.trim(), customerPhone: phone.trim(), customerEmail: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create subscription");
      }

      const { subscriptionId, planId, amount, currency, key } = await res.json();

      const options = {
        key,
        amount,
        currency,
        name: "Shree Gurudev Plastics",
        description: "Monthly Maintenance Subscription",
        subscription_id: subscriptionId,
        prefill: { contact: phone.trim(), name: name.trim(), email: email.trim() },
        handler: () => {
          setStatus("success");
          setMessage("Subscription activated! Auto-pay set up for 1st of every month.");
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment cancelled. You can try again anytime.");
            setStatus("error");
          },
        },
        theme: { color: "#f97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setLoading(false);
        setMessage(response.error?.description || "Payment failed");
        setStatus("error");
      });
      rzp.open();
    } catch (error: any) {
      setLoading(false);
      setMessage(error.message || "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <MdCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-green-800 mb-2">Autopay Activated!</h3>
        <p className="text-sm text-green-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <MdAutorenew className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Monthly Maintenance Autopay</h3>
          <p className="text-sm text-gray-500">Rs.6,000/month — auto-debited on 1st</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Set up UPI autopay once. Amount auto-debited on 1st of every month. No manual payment needed.
      </p>

      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          <MdError className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{message}</p>
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <MdAutorenew size={16} />
            Set Up Autopay — Rs.6,000/month
          </>
        )}
      </button>
    </div>
  );
}
