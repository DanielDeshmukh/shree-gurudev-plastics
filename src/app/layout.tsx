import type { Metadata, Viewport } from "next";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import "./globals.css";

const SITE_URL = "https://shreegurudevplastics.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shree Gurudev Plastics | Premium Plastic Products",
    template: "%s | Shree Gurudev Plastics",
  },
  description: "Premium plastic products for every need — chairs, tables, buckets, containers, and more. Trusted by thousands. Shop from Aristo, KG Plast, and Mango Chairs.",
  keywords: ["plastic products", "plastic chairs", "plastic tables", "plastic buckets", "plastic containers", "Aristo", "KG Plast", "Mango Chairs", "Shree Gurudev Plastics", "wholesale plastic products", "Naigaon", "Mumbai"],
  authors: [{ name: "Shree Gurudev Plastics" }],
  creator: "Shree Gurudev Plastics",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Shree Gurudev Plastics",
    title: "Shree Gurudev Plastics | Premium Plastic Products",
    description: "Premium plastic products for every need — chairs, tables, buckets, containers, and more.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Shree Gurudev Plastics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Gurudev Plastics | Premium Plastic Products",
    description: "Premium plastic products for every need — chairs, tables, buckets, containers, and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
