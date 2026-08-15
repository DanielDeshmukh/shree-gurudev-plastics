"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-7xl font-bold text-primary-500">!</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong</h1>
        <p className="text-gray-600 mb-2">An unexpected error occurred. Please try again.</p>
        {error.digest && <p className="text-xs text-gray-400 mb-6 font-mono">Error ID: {error.digest}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
            Try Again
          </button>
          <Link href="/" className="rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
