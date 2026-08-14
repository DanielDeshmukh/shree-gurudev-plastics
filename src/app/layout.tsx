import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shree Gurudev Plastics",
  description: "Premium plastic products - Chairs, Tables, Buckets, Containers & more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
