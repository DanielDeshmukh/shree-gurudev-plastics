"use client";

import { useState, FormEvent } from "react";
import { PHONE } from "@/lib/seo";

interface PincodeResult {
  available: boolean;
  area?: string;
  estimatedDays?: string;
  deliveryCharge?: string;
}

export default function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pincode.length !== 6) return;

    setLoading(true);
    setResult(null);
    setError(false);

    try {
      const res = await fetch(`/api/pincode?pincode=${pincode}`);
      if (res.ok) {
        const data = await res.json();
        setResult({ available: true, ...data.pincode });
      } else {
        setResult({ available: false });
        setError(true);
      }
    } catch {
      setResult({ available: false });
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(val);
            setResult(null);
            setError(false);
          }}
          placeholder="Enter pincode"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          type="submit"
          disabled={pincode.length !== 6 || loading}
          className="px-5 py-2.5 bg-primary-500 text-white font-medium text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "Check"
          )}
        </button>
      </form>

      {result && result.available && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-green-800 text-sm font-medium">
              Delivery available to {result.area} ({pincode})
            </p>
            <p className="text-green-700 text-xs mt-0.5">
              Estimated delivery: {result.estimatedDays} &middot; {result.deliveryCharge}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p className="text-red-800 text-sm font-medium">Delivery not available to this pincode.</p>
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hi, I'd like to check if delivery is available to my area. Pincode: ${pincode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-700 text-xs underline mt-0.5 inline-block hover:text-red-900"
            >
              Contact us on WhatsApp for special arrangements
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
