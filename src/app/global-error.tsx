"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <span className="text-7xl font-bold text-primary-500">!</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-gray-400 mb-2">A critical error occurred. Our team has been notified.</p>
          {error.digest && <p className="text-xs text-gray-600 mb-6 font-mono">Error ID: {error.digest}</p>}
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
              Try Again
            </button>
            <Link href="/" className="rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
