"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <span className="text-6xl font-bold text-red-500">!</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-gray-400 mb-2">An error occurred while loading this page.</p>
        {error.digest && <p className="text-xs text-gray-600 mb-6 font-mono">Error ID: {error.digest}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
