import type { Metadata } from "next";
import { SITE_URL, BUSINESS_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `All Products — Wholesale Plastic Items | ${BUSINESS_NAME}`,
  description: `Browse our complete collection of premium plastic products — chairs, tables, buckets, containers, storage solutions and more at wholesale prices. Free delivery in Bhayander, Mumbai.`,
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: `All Products | ${BUSINESS_NAME} — Wholesale Plastic Items`,
    description: "Browse premium plastic products at wholesale prices. Chairs, tables, buckets, containers from top brands.",
    url: `${SITE_URL}/products`,
    siteName: BUSINESS_NAME,
    locale: "en_IN",
    type: "website",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
