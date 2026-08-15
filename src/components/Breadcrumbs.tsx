import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-8">
      <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
      {items.map((item, i) => (
        <span key={i}>
          <span className="mx-2">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-500 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
