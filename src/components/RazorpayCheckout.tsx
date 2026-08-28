"use client";

import { useState } from "react";
import { MdCreditCard, MdLock } from "react-icons/md";

interface RazorpayCheckoutProps {
  orderId: number;
  amount: number;
  customer: string;
  phone: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({ orderId, amount, customer, phone, onSuccess, onError }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount, customer, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create payment order");
      }

      const { orderId: rpOrderId, amount: rpAmount, currency, key } = await res.json();

      const options = {
        key,
        amount: rpAmount,
        currency,
        name: "Shree Gurudev Plastics",
        description: `Order #${orderId}`,
        order_id: rpOrderId,
        prefill: { contact: phone, name: customer },
        theme: { color: "#f97316" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            onSuccess(response.razorpay_payment_id);
          } catch {
            onError("Payment was made but verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onError("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setLoading(false);
        onError(response.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (error: any) {
      setLoading(false);
      onError(error.message || "Failed to initiate payment");
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          <MdCreditCard size={18} />
          Pay Rs.{amount.toLocaleString("en-IN")} via Razorpay
        </>
      )}
    </button>
  );
}
