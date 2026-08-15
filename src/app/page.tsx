import type { Metadata } from "next";
import { SITE_URL, BUSINESS_NAME, CITY, PHONE, getFAQSchema } from "@/lib/seo";
import RecentlyViewed from "@/components/RecentlyViewed";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Home",
  description: "Shree Gurudev Plastics — Bhayander's #1 plastic products distributor and bulk seller. Buy plastic chairs, tables, buckets, containers, stools at wholesale prices. Serving Bhayander, Naigaon, Vasai, Virar, Mumbai. Top brands: Aristo, KG Plast, Mango Chairs, Milton. Contact for bulk orders.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Shree Gurudev Plastics | Bulk Plastic Products Distributor in Bhayander, Mumbai",
    description: "Bhayander's leading plastic products distributor. Plastic chairs, tables, buckets, containers at wholesale prices.",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const homeFaqs = [
  { question: "Do you offer bulk pricing on plastic products?", answer: "Yes, Shree Gurudev Plastics is a wholesale distributor. We offer competitive bulk pricing for retailers, businesses, event organizers, and individual bulk buyers. Contact us on WhatsApp for bulk quotes." },
  { question: "Which areas do you deliver to?", answer: "We deliver across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar. Contact us for delivery details and minimum order requirements." },
  { question: "What brands do you stock?", answer: "We stock Aristo, KG Plast, Mango Chairs, Rajdhani, Cosmos, Milton, Borosil, Signoraware, and other leading plastic product brands." },
  { question: "What types of plastic products do you sell?", answer: "We sell plastic chairs, tables, stools, buckets, containers, storage boxes, kitchenware, baskets, trays, and more — all from trusted brands at wholesale prices." },
  { question: "How can I place an order?", answer: "You can browse our products online and contact us via WhatsApp at +91 85520 84251 to place orders or get quotes. We respond quickly to all inquiries." },
];
const faqSchema = getFAQSchema(homeFaqs);

async function getBrands() {
  const res = await fetch("/api/brands", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.brands || [];
}

async function getProducts() {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

export default async function Home() {
  const brands = await getBrands();
  const allProducts = await getProducts();
  const featured = allProducts.slice(0, 8);

  return (
    <main className="min-h-screen">
      <HomeContent brands={brands} featured={featured} />
      <RecentlyViewed />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
