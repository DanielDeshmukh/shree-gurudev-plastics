import type { Metadata, Viewport } from "next";
import PublicShell from "@/components/PublicShell";
import SWRegister from "@/components/SWRegister";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import PhonePromptModal from "@/components/PhonePromptModal";
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
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Shree Gurudev Plastics — Plastic Products Distributor Bhayander" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Gurudev Plastics | Bulk Plastic Products Distributor in Bhayander, Mumbai",
    description: "Bhayander's leading plastic products distributor and bulk seller. Plastic chairs, tables, buckets, containers at wholesale prices.",
    images: ["/og-image.svg"],
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SGP Plastics" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </head>
      <body>
        <CustomerAuthProvider>
          <LanguageProvider>
            <CartProvider>
              <CompareProvider>
                <RecentlyViewedProvider>
                  <WishlistProvider>
                    <PublicShell>{children}</PublicShell>
                    <PhonePromptModal />
                    <SWRegister />
                  </WishlistProvider>
                </RecentlyViewedProvider>
              </CompareProvider>
            </CartProvider>
          </LanguageProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
