"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const SKIP_KEY = "sgp_phone_prompt_skipped";

export default function PhonePromptModal() {
  const { showPhonePrompt, setShowPhonePrompt, updatePhone, user } = useCustomerAuth();
  const pathname = usePathname();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showPhonePrompt || pathname.startsWith("/admin")) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    const result = await updatePhone(phone);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Failed to save phone number");
    }
  };

  const handleSkip = () => {
    setShowPhonePrompt(false);
    if (user?.email) {
      localStorage.setItem(SKIP_KEY, JSON.stringify(user.email));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-primary-500 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Welcome, {user?.name}!</h2>
          <p className="text-primary-100 text-sm mt-1">Add your phone number for order updates</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <p className="text-xs text-gray-500">
            We&apos;ll use this for WhatsApp order confirmations and delivery updates. Your number stays private.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Saving..." : "Save Number"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
