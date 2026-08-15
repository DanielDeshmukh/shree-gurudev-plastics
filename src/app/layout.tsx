import type { Metadata, Viewport } from "next";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartButton from "@/components/CartButton";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import CompareBar from "@/components/CompareBar";
import { SITE_URL, BUSINESS_NAME, ALL_KEYWORDS, getLocalBusinessSchema } from "@/lib/seo";
import "./globals.css";

const localBusinessSchema = getLocalBusinessSchema();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shree Gurudev Plastics | Bulk Plastic Products Distributor in Bhayander, Mumbai",
    template: "%s | Shree Gurudev Plastics — Plastic Products Distributor Bhayander",
  },
  description: "Shree Gurudev Plastics — Bhayander's leading plastic products distributor and bulk seller. Buy plastic chairs, tables, buckets, containers, stools, storage, kitchenware at wholesale prices from top brands. Serving Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane. Bulk plastic seller, plastic wholesaler, plastic dealer near you.",
  keywords: ALL_KEYWORDS,
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: "Shree Gurudev Plastics | Bulk Plastic Products Distributor in Bhayander, Mumbai",
    description: "Bhayander's leading plastic products distributor and bulk seller. Plastic chairs, tables, buckets, containers at wholesale prices. Serving Mumbai, Naigaon, Vasai, Virar.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Shree Gurudev Plastics — Plastic Products Distributor Bhayander" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Gurudev Plastics | Bulk Plastic Products Distributor in Bhayander, Mumbai",
    description: "Bhayander's leading plastic products distributor and bulk seller. Plastic chairs, tables, buckets, containers at wholesale prices.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </head>
      <body>
        <CartProvider>
          <CompareProvider>
            <RecentlyViewedProvider>
              <Navbar />
              {children}
              <Footer />
              <WhatsAppButton />
              <CartButton />
              <CompareBar />
            </RecentlyViewedProvider>
          </CompareProvider>
        </CartProvider>
      </body>
    </html>
  );
}
