import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBreadcrumbSchema, getLocalBusinessSchema, getFAQSchema, SITE_URL, BUSINESS_NAME, CITY, PHONE_DISPLAY, PHONE, ADDRESS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us — Shree Gurudev Plastics | Plastic Products Distributor in Bhayander",
  description: `Shree Gurudev Plastics is a leading plastic products distributor and bulk seller in Bhayander, Mumbai. We supply plastic chairs, tables, buckets, containers, and more from top brands to Bhayander, Naigaon, Vasai, Virar, Mumbai, and Thane. Wholesale plastic products at best prices. Trusted distributor since years.`,
  keywords: ["about Shree Gurudev Plastics", "plastic distributor Bhayander", "plastic bulk seller Mumbai", "plastic wholesaler Bhayander", "plastic products supplier Naigaon", "plastic dealer Vasai", "wholesale plastic Mumbai"],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Us — Shree Gurudev Plastics",
    description: "Leading plastic products distributor and bulk seller in Bhayander, Mumbai.",
    url: `${SITE_URL}/about`,
    siteName: BUSINESS_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = getLocalBusinessSchema();
const breadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
]);

const faqs = [
  { question: "Where is Shree Gurudev Plastics located?", answer: `Shree Gurudev Plastics is located in ${ADDRESS}. We serve customers across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar.` },
  { question: "What products does Shree Gurudev Plastics sell?", answer: "We are a plastic products distributor selling plastic chairs, tables, stools, buckets, containers, storage boxes, kitchenware, baskets, trays, and more from top brands." },
  { question: "Do you offer bulk or wholesale pricing?", answer: "Yes, we are a bulk seller and wholesale distributor. We offer competitive pricing for retailers, businesses, event organizers, and individual bulk buyers." },
  { question: "What brands do you distribute?", answer: "We distribute products from Aristo, Mango Chairs, Rajdhani, Cosmos, Milton, Borosil, Signoraware, and other leading plastic brands." },
  { question: "Do you deliver across Mumbai?", answer: "Yes, we deliver across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar. Contact us on WhatsApp for delivery details." },
];
const faqSchema = getFAQSchema(faqs);

const serviceAreas = [
  { city: "Bhayander", desc: "Our home base. Fast delivery and pickup available for all plastic products." },
  { city: "Naigaon", desc: "Neighbouring area with same-day delivery on most plastic products." },
  { city: "Vasai", desc: "Wide range of plastic products delivered to your doorstep in Vasai." },
  { city: "Virar", desc: "Bulk and retail orders delivered across Virar." },
  { city: "Mumbai", desc: "Full range of plastic products available for delivery across Mumbai." },
  { city: "Thane", desc: "Plastic furniture, containers, and more delivered to Thane." },
  { city: "Palghar", desc: "Wholesale plastic products delivered to Palghar district." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "About Us" }]} />

        <h1 className="text-3xl font-bold text-gray-900 mb-6">About {BUSINESS_NAME}</h1>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0">
              <img src="/logo.png" alt="Shree Gurudev Plastics" className="w-48 h-auto rounded-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {BUSINESS_NAME} is a trusted plastic products distributor and bulk seller based in {CITY}, Mumbai.
                We have been serving customers with high-quality plastic products including chairs, tables, stools,
                buckets, containers, storage solutions, kitchenware, and household accessories from leading brands.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                As a wholesale distributor, we cater to a wide range of customers — from individual buyers looking
                for durable plastic furniture to retailers, event organizers, canteens, hostels, and businesses
                seeking bulk quantities at competitive prices. Our commitment to quality and customer satisfaction
                has made us a preferred name in the plastic products industry.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We stock products from top brands like Aristo, Mango Chairs, Rajdhani, Milton, Borosil,
                Signoraware, and more. Whether you need a single plastic chair or thousands of containers for your
                business, {BUSINESS_NAME} is your one-stop destination for all plastic products in the Mumbai region.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Retail Sales", desc: "Buy individual plastic products at the best prices. Visit our store or order online." },
              { title: "Bulk & Wholesale", desc: "Special pricing for bulk orders. Ideal for retailers, businesses, and event organizers." },
              { title: "Wide Range", desc: "Chairs, tables, buckets, containers, kitchenware, storage — all from top brands." },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Service Areas</h2>
          <p className="text-gray-600 mb-6">
            {BUSINESS_NAME} serves customers across the Mumbai metropolitan region. We are based in {CITY}
            and deliver to the following areas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceAreas.map((area) => (
              <div key={area.city} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-primary-500 mb-1">{area.city}</h3>
                <p className="text-gray-600 text-sm">{area.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Competitive Prices", desc: "As a bulk distributor, we offer the best wholesale prices on all plastic products." },
              { title: "Top Brands", desc: "We stock only trusted brands — Aristo, Mango Chairs, Milton, and more." },
              { title: "Wide Selection", desc: "500+ products across furniture, containers, storage, kitchen, and accessories." },
              { title: "Fast Delivery", desc: "Quick delivery across Bhayander, Naigaon, Vasai, Virar, Mumbai, and Thane." },
              { title: "Quality Products", desc: "Durable, long-lasting plastic products made from premium materials." },
              { title: "Trusted by Thousands", desc: "Thousands of happy customers trust us for their plastic product needs." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-primary-500 font-bold w-20">Address:</span>
              <span className="text-gray-600">{ADDRESS}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary-500 font-bold w-20">Phone:</span>
              <a href={`tel:${PHONE}`} className="text-primary-500 hover:underline">{PHONE_DISPLAY}</a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary-500 font-bold w-20">WhatsApp:</span>
              <a href={`https://wa.me/${PHONE}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">{PHONE_DISPLAY}</a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary-500 font-bold w-20">Hours:</span>
              <span className="text-gray-600">Mon–Sat: 9:00 AM – 8:00 PM</span>
            </div>
          </div>
        </section>

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
          <h2 className="text-2xl font-bold mb-3">Ready to Order?</h2>
          <p className="text-gray-300 mb-6">Contact {BUSINESS_NAME} for bulk orders and wholesale pricing on plastic products.</p>
          <a
            href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to know more about your plastic products.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp Us
          </a>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
