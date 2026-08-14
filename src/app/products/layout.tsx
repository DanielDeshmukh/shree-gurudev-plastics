import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of premium plastic products — chairs, tables, buckets, containers, storage solutions and more.",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
