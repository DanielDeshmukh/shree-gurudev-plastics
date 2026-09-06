import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBreadcrumbSchema, SITE_URL, BUSINESS_NAME, PHONE_DISPLAY, PHONE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to Order — Shree Gurudev Plastics | Step-by-Step Guide",
  description: "Learn how to browse, compare, checkout, and track your plastic products order at Shree Gurudev Plastics. Simple 5-step guide for wholesale and retail buyers.",
  keywords: ["how to order", "order plastic products", "buy plastic chairs online", "wholesale order guide", "Shree Gurudev Plastics order"],
  alternates: { canonical: `${SITE_URL}/how-to-order` },
  openGraph: {
    title: "How to Order — Shree Gurudev Plastics",
    description: "Simple 5-step guide to ordering plastic products online.",
    url: `${SITE_URL}/how-to-order`,
    siteName: BUSINESS_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const breadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "How to Order", url: "/how-to-order" },
]);

const steps = [
  {
    num: 1,
    title: "Search & Filter",
    desc: "Looking for something specific? Use the search bar to find products instantly. Apply filters for brand (Aristo, Mango Chairs), price range, stock availability, and tags to narrow down exactly what you need.",
    image: "/shree-gurudev-plastics-products.png",
    alt: "Search and filter options on products page",
  },
  {
    num: 2,
    title: "Browse Products",
    desc: "Explore 1360+ plastic products across categories like Chairs, Tables, Stools, Houseware, Dustbins, and Cabinets. Sort by price, popularity, or newest arrivals to find the best match.",
    image: "/shree-gurudev-plastics-products-page.png",
    alt: "Products page showing categories and filters",
  },
  {
    num: 3,
    title: "Compare & Choose",
    desc: "Not sure which product to pick? Use our compare feature to view up to 4 products side-by-side. See ratings, popularity, and pricing differences at a glance — and share the comparison with your team.",
    image: "/shree-gurudev-plastics-compare-page-upto-4-products-with-highlighting-most-bought-among-and-share-option-as-well.png",
    alt: "Compare page showing side-by-side product comparison",
  },
  {
    num: 4,
    title: "Checkout & Pay",
    desc: "Sign in with your Google account, add your delivery address, and complete payment securely via Razorpay. Pay using UPI, cards, net banking, or wallets. You will receive order confirmation instantly.",
    image: "/shree-gurudev-plastics-order-completed-modal-with-order-tracking-feature.png",
    alt: "Order completed modal with tracking details",
  },
  {
    num: 5,
    title: "Track Your Order",
    desc: "Get a unique tracking link the moment your order is placed. Share it with anyone — no login needed. Follow your order status in real time from confirmed to out for delivery.",
    image: "/shree-gurudev-plastics-order-tracking-completed-tracks within-seconds.png",
    alt: "Live order tracking page showing status updates",
  },
];

const faqs = [
  { question: "Do I need an account to place an order?", answer: "Yes, you need to sign in with your Google account. This helps us track your orders, send notifications, and provide a seamless experience." },
  { question: "What payment methods are accepted?", answer: "We accept UPI (Google Pay, PhonePe, Paytm), debit cards, credit cards, net banking, and popular wallets — all powered by Razorpay." },
  { question: "Is there a minimum order quantity?", answer: "No minimum order required. However, we offer tiered pricing: 10+ items get 10% off, and 100+ items get 25% off. Festival offers may provide additional discounts." },
  { question: "How do I track my order after placing it?", answer: "Your order confirmation includes a unique tracking link. You can also visit /track and enter your order token to check status in real time." },
  { question: "Can I compare products before buying?", answer: "Yes! Click the compare button on any product to add it to your comparison list. You can compare up to 4 products side-by-side and share the link with others." },
];

export default function HowToOrderPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "How to Order" }]} />

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How to Order in 5 Easy Steps</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From browsing to delivery — ordering plastic products from {BUSINESS_NAME} is simple, fast, and secure.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {steps.map((step) => (
            <section key={step.num} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className={`flex flex-col ${step.num % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {step.num}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-4">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={600}
                    height={400}
                    unoptimized
                    className="rounded-lg shadow-md w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Shop?</h2>
          <p className="text-gray-300 mb-6">Browse 1360+ plastic products from top brands at the best wholesale prices.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse Products
            </Link>
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to place an order.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
