import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-primary-500 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-6">The admin page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/admin/dashboard" className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
