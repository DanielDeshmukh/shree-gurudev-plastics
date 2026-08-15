import Link from "next/link";
import { MdWifiOff } from "react-icons/md";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center"><MdWifiOff className="text-7xl text-gray-400" /></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Offline</h1>
        <p className="text-gray-600 mb-6">
          It looks like you&apos;ve lost your internet connection. Please check your
          network and try again.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}
