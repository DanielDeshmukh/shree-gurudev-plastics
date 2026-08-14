import Link from "next/link";

interface RequestQuoteButtonProps {
  category?: string;
  className?: string;
}

export default function RequestQuoteButton({ category, className }: RequestQuoteButtonProps) {
  const href = category ? `/quote?category=${encodeURIComponent(category)}` : "/quote";

  return (
    <Link
      href={href}
      className={className || "inline-block bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"}
    >
      Request a Quote
    </Link>
  );
}
