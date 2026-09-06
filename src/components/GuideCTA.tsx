"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { PHONE } from "@/lib/seo";

export default function GuideCTA() {
  const { user } = useCustomerAuth();

  useEffect(() => {
    if (user) {
      fetch("/api/auth/seen-guide", { method: "POST", credentials: "include" }).catch(() => {});
    }
  }, [user]);

  return (
    <section className="bg-gray-900 text-white rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-3">Ready to Start Shopping?</h2>
      <p className="text-gray-300 mb-6">Browse 1360+ plastic products from top brands at the best wholesale prices.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Start Shopping
        </Link>
        <a
          href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to place an order.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          WhatsApp Us
        </a>
      </div>
    </section>
  );
}
