"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdLocalShipping } from "react-icons/md";

export default function TrackOrderPage() {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = link.trim();

    if (!trimmed) {
      setError("Please enter a tracking link");
      return;
    }

    // Extract token from full URL or accept raw token
    let token = "";
    try {
      if (trimmed.includes("/track/")) {
        const parts = trimmed.split("/track/");
        token = parts[1]?.split(/[?#]/)[0]?.trim() || "";
      } else if (/^[a-f0-9]{32}$/i.test(trimmed)) {
        token = trimmed;
      }
    } catch {
      setError("Invalid tracking link format");
      return;
    }

    if (!token || !/^[a-f0-9]{32}$/i.test(token)) {
      setError("Could not extract a valid tracking token. Please check the link.");
      return;
    }

    router.push(`/track/${token}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mx-auto mb-5">
            <MdLocalShipping className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Track Your Order</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Paste your tracking link to view order status
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={link}
                onChange={(e) => { setLink(e.target.value); setError(""); }}
                placeholder="Paste tracking link or token..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {error && (
                <p className="text-xs text-red-500 mt-1.5">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
            >
              Track Order
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-5">
            Example: shreegurudevplastics.com/track/490ee14f...
          </p>
        </div>
      </div>
    </div>
  );
}
