import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, BUSINESS_NAME, CITY, PHONE, ADDRESS, getFAQSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Service Areas & Locations | Plastic Products Dealer in Bhayander, Mumbai",
  description: `${BUSINESS_NAME} delivers plastic products across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane & Palghar. Same-day delivery in Bhayander & Naigaon. Free delivery above â‚¹5,000. Wholesale plastic chairs, tables, buckets, containers.`,
  keywords: [
    "plastic products dealer Bhayander", "plastic distributor Bhayander", "plastic products Naigaon",
    "plastic wholesale Vasai", "plastic supplier Virar", "plastic products Mumbai",
    "plastic distributor Thane", "plastic dealer Palghar", "plastic products delivery Bhayander",
    "plastic chairs delivery Mumbai", "wholesale plastic Bhayander", "plastic furniture dealer Naigaon",
    "plastic containers wholesale Vasai", "bulk plastic products Mumbai", "plastic products near me",
    "plastic dealer near me Bhayander", "plastic products supplier Maharashtra",
  ],
  alternates: { canonical: `${SITE_URL}/locations` },
  openGraph: {
    title: `${BUSINESS_NAME} | Service Areas - Bhayander, Naigaon, Vasai, Virar, Mumbai`,
    description: "Delivering premium plastic products across Mumbai region. Same-day delivery in Bhayander & Naigaon. Free delivery above â‚¹5,000.",
    url: `${SITE_URL}/locations`,
    siteName: BUSINESS_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const areas = [
  {
    name: "Bhayander",
    isHQ: true,
    description: "Our headquarters. Full product range available for same-day pickup or delivery. Visit our warehouse to see all products before buying.",
  },
  {
    name: "Naigaon",
    isHQ: false,
    description: "Same-day delivery available. Full product range delivered to your doorstep. No shipping charges on orders above â‚¹5,000.",
  },
  {
    name: "Vasai",
    isHQ: false,
    description: "Next-day delivery on most products. Wide range of plastic furniture, containers, and kitchenware delivered to Vasai.",
  },
  {
    name: "Virar",
    isHQ: false,
    description: "Fast delivery to Virar. Complete range of plastic chairs, tables, buckets, and storage solutions at wholesale prices.",
  },
  {
    name: "Mumbai",
    isHQ: false,
    description: "We deliver across Mumbai city. Contact us for delivery timelines based on your specific location within Mumbai.",
  },
  {
    name: "Thane",
    isHQ: false,
    description: "Reliable delivery to Thane. Bulk and retail orders for plastic products delivered at wholesale prices.",
  },
  {
    name: "Palghar",
    isHQ: false,
    description: "Delivery available to Palghar. Contact us for current delivery schedule and minimum order requirements.",
  },
];

const benefits = [
  {
    title: "Same-Day Delivery for Bhayander & Naigaon",
    description: "Order before 2 PM and get same-day delivery in Bhayander and Naigaon. No waiting for days â€” your plastic products arrive the same day.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "No Shipping Charges for Local Orders",
    description: "Free delivery for orders above â‚¹5,000 in Bhayander and Naigaon. Save money when you buy locally instead of ordering online.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Direct Wholesale Prices",
    description: "Buy directly from the distributor â€” no middleman, no markup. Get the lowest wholesale prices on all plastic products from top brands.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Visit Our Warehouse",
    description: "See and touch products before you buy. Visit our warehouse in Naigaon, Bhayander to inspect the full range of plastic furniture and products.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

const faqs = [
  {
    question: "Do you deliver outside Maharashtra?",
    answer: "Currently we deliver across Maharashtra. Contact us for outstation orders and we will do our best to accommodate your request.",
  },
  {
    question: "What are your delivery timings?",
    answer: "We deliver Monday to Saturday, 9 AM to 8 PM. No deliveries on Sundays and public holidays.",
  },
  {
    question: "Is there free delivery?",
    answer: "Free delivery for orders above â‚¹5,000 in Bhayander and Naigaon. Contact us for delivery charges and free delivery thresholds in other areas.",
  },
  {
    question: "Can I visit your warehouse?",
    answer: "Yes! Visit us at Naigaon, Bhayander. Contact us on WhatsApp for the exact address and to schedule a visit.",
  },
];
const faqSchema = getFAQSchema(faqs);

const whatsappUrl = (area: string) =>
  `https://wa.me/${PHONE}?text=${encodeURIComponent(`Namaste!\n\nI am interested in ordering from ${area}. Do you deliver here?\n\nThank you!`)}`;

export default function LocationsPage() {
  return (
    <main className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-32 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Service Areas</h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-4">
            Delivering premium plastic products across the Mumbai region
          </p>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
            From our headquarters in {CITY}, we serve customers across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar.
            Same-day delivery available for local areas.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Where We Deliver</h2>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          We deliver plastic chairs, tables, buckets, containers, and more across {CITY} and the Mumbai metropolitan region.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div
              key={area.name}
              className={`rounded-xl p-6 border transition-shadow ${
                area.isHQ
                  ? "bg-primary-50 border-primary-300 shadow-md ring-2 ring-primary-200"
                  : "bg-white border-gray-200 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <h3 className={`text-xl font-bold ${area.isHQ ? "text-primary-600" : "text-gray-900"}`}>
                  {area.name}
                </h3>
                {area.isHQ && (
                  <span className="text-xs font-semibold bg-primary-500 text-white px-2 py-1 rounded-full">
                    Headquarters
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{area.description}</p>
              <a
                href={whatsappUrl(area.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enquire on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why Buy From Us Locally</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Skip online sellers and middlemen. Buy directly from {BUSINESS_NAME} in {CITY} for the best prices and fastest delivery.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-primary-500 mb-4">{benefit.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Find Us</h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-xl overflow-hidden">
            <div className="relative h-64 bg-gray-200">
              <iframe
                src="https://maps.google.com/maps?q=Shree+Gurudev+Plastics+Naigaon+Bhayander&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Gurudev Plastics Location"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-3">{BUSINESS_NAME}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium mb-1">Address</p>
                  <p className="text-gray-700">{ADDRESS}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1">Phone</p>
                  <a href={`tel:${PHONE}`} className="text-primary-500 hover:text-primary-600 transition-colors">+91 85520 84251</a>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1">Business Hours</p>
                  <p className="text-gray-700">Mon â€“ Sat: 9:00 AM â€“ 8:00 PM</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1">Service Areas</p>
                  <p className="text-gray-700">Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, Palghar</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://maps.app.goo.gl/VFJQ1jPsdDKddinF9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Directions
                </a>
                <a
                  href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to visit your warehouse. Can you share the exact address?")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Order?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us on WhatsApp for bulk quotes, delivery details, or to visit our warehouse in {CITY}.
            We deliver across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to enquire about plastic products delivery.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-block bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
