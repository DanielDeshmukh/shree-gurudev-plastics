import type { Metadata } from "next";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBreadcrumbSchema, getFAQSchema, SITE_URL, BUSINESS_NAME, CITY } from "@/lib/seo";
import { apiFetch } from "@/lib/api-fetch";
import { PHONE } from "@/lib/seo";

const categoryMeta: Record<string, { title: string; description: string; keywords: string[]; about: string; faqs: { question: string; answer: string }[] }> = {
  chairs: {
    title: "Plastic Chairs Bhayander | Armless, Premium, Medium Back — Bulk Seller",
    description: "Buy plastic chairs in Bhayander — armless chairs, baby chairs, premium chairs, medium back chairs, HoReCa chairs from Mango, Aristo, Reego. Wholesale plastic chairs distributor in Mumbai. Best prices on bulk plastic chairs Bhayander, Naigaon, Vasai.",
    keywords: ["plastic chairs Bhayander", "armless chairs Mumbai", "premium chairs wholesale", "medium back plastic chair", "baby chairs Bhayander", "HoReCa chairs bulk", "Mango chairs", "Aristo chairs", "plastic chair price", "wholesale plastic chairs Mumbai"],
    about: "Shree Gurudev Plastics is Bhayander's leading plastic chair distributor. We stock armless chairs, baby chairs, premium chairs, medium back chairs, economical chairs, and HoReCa chairs from top brands like Mango Chairs, Aristo, and Reego. Whether you need chairs for your home, office, restaurant, or event, we offer the best wholesale prices in Bhayander, Naigaon, Vasai, and Mumbai area.",
    faqs: [
      { question: "What types of plastic chairs do you sell?", answer: "We stock armless chairs, baby chairs, premium chairs, medium back chairs, economical chairs, HoReCa chairs, armrest chairs, executive chairs, and more from brands like Mango, Aristo, and Reego." },
      { question: "Do you offer bulk discounts on chairs?", answer: "Yes, Shree Gurudev Plastics offers competitive bulk pricing on all plastic chairs. Contact us on WhatsApp at +91 85520 84251 for bulk order quotes." },
      { question: "Which brands of chairs do you stock?", answer: "We stock Mango Chairs, Aristo, Reego, and other leading plastic chair brands at our Bhayander store." },
      { question: "Do you deliver chairs in Mumbai?", answer: "Yes, we deliver plastic chairs across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar." },
    ],
  },
  stools: {
    title: "Plastic Stools Bhayander | Round & Square Stools — Wholesale Seller",
    description: "Buy plastic stools in Bhayander — round stools, square stools, folding stools from Mango, Aristo. Wholesale plastic stools distributor in Mumbai. Best prices on bulk plastic stools Bhayander, Naigaon, Vasai.",
    keywords: ["plastic stools Bhayander", "round plastic stool", "square plastic stool", "wholesale plastic stools", "bulk plastic stools Mumbai", "Mango stools", "Aristo stools", "plastic stool price", "folding stool Bhayander"],
    about: "Shree Gurudev Plastics offers a wide range of plastic stools in Bhayander. From round stools and square stools to folding and step stools, we have durable options for homes, shops, and commercial spaces. Available at wholesale prices from top brands.",
    faqs: [
      { question: "What types of plastic stools do you have?", answer: "We stock round stools, square stools, step stools, folding stools, and backless stools in various sizes and colors." },
      { question: "Do you sell stools in bulk?", answer: "Yes, we offer special bulk pricing for plastic stools. Ideal for retailers, restaurants, and businesses. Contact us on WhatsApp for quotes." },
    ],
  },
  tables: {
    title: "Plastic Tables Bhayander | Dining & Folding Tables — Wholesale Distributor",
    description: "Buy plastic tables in Bhayander — dining tables, folding tables, center tables, utility tables from Mango Chairs. Wholesale plastic tables distributor in Mumbai. Best prices on bulk plastic tables Bhayander, Naigaon, Vasai.",
    keywords: ["plastic tables Bhayander", "plastic dining table", "folding table Bhayander", "wholesale plastic tables", "bulk plastic tables Mumbai", "Mango tables", "plastic table price", "plastic center table"],
    about: "Shree Gurudev Plastics stocks a variety of plastic tables in Bhayander including dining tables, folding tables, juice tables, fruit tables, and utility tables from Mango Chairs. Perfect for homes, restaurants, events, and commercial use at wholesale prices.",
    faqs: [
      { question: "What types of plastic tables do you sell?", answer: "We stock dining tables, folding tables, center tables, juice tables, fruit tables, and utility tables from Mango Chairs." },
      { question: "Do you offer bulk pricing on tables?", answer: "Yes, we offer competitive bulk pricing on all plastic tables. Contact us on WhatsApp for quotes." },
    ],
  },
  houseware: {
    title: "Plastic Houseware Bhayander | Containers, Kitchen, Storage — Wholesale",
    description: "Buy plastic houseware in Bhayander — storage containers, kitchen items, bath accessories, racks, planters from Aristo. Wholesale plastic houseware distributor in Mumbai. Best prices on bulk houseware Bhayander, Naigaon, Vasai.",
    keywords: ["plastic houseware Bhayander", "storage containers Bhayander", "kitchen accessories Bhayander", "Aristo houseware", "wholesale plastic houseware", "bulk houseware Mumbai", "plastic containers price", "bath accessories Bhayander"],
    about: "Shree Gurudev Plastics is Bhayander's trusted houseware distributor. We offer storage containers, kitchen items, bath accessories, baskets, bowls, planters, sprayers, racks, and more from Aristo. Wholesale prices for both retail and bulk buyers across Mumbai.",
    faqs: [
      { question: "What houseware products do you stock?", answer: "We stock storage containers, kitchen items, bath accessories, baskets, bowls, planters, sprayers, racks, school items, and more from Aristo." },
      { question: "Do you sell houseware in bulk?", answer: "Yes, we are a wholesale houseware distributor. We offer bulk pricing for retailers and businesses across Mumbai." },
    ],
  },
  dustbins: {
    title: "Plastic Dustbins Bhayander | Pedal Bins, Swing Bins — Wholesale Seller",
    description: "Buy plastic dustbins in Bhayander — pedal bins, swing bins, waste baskets, trash cans from Aristo, Mango. Wholesale plastic dustbin distributor in Mumbai. Best prices on bulk dustbins Bhayander, Naigaon, Vasai.",
    keywords: ["plastic dustbins Bhayander", "pedal bin Bhayander", "swing bin Mumbai", "waste basket wholesale", "trash can Bhayander", "Aristo dustbins", "Mango dustbins", "plastic dustbin price", "bulk dustbins Mumbai"],
    about: "Shree Gurudev Plastics stocks a wide range of plastic dustbins in Bhayander. From pedal bins and swing bins to open waste baskets and kitchen dustbins, we offer durable waste management solutions from Aristo and Mango at wholesale prices.",
    faqs: [
      { question: "What types of dustbins do you have?", answer: "We stock pedal bins, swing bins, open waste baskets, kitchen dustbins, and industrial waste bins in various sizes and colors." },
      { question: "Do you sell dustbins in bulk?", answer: "Yes, we offer bulk pricing on all dustbin products. Ideal for housing societies, offices, restaurants, and retailers. Contact us on WhatsApp." },
    ],
  },
  household: {
    title: "Plastic Household Products Bhayander | Home Essentials — Wholesale",
    description: "Buy plastic household products in Bhayander — bathroom accessories, home storage, utility items from Mango Chairs. Wholesale household products distributor in Mumbai. Best prices on bulk household items Bhayander.",
    keywords: ["plastic household Bhayander", "home accessories Bhayander", "bathroom accessories", "wholesale household products", "bulk home items Mumbai", "Mango household", "plastic home essentials"],
    about: "Shree Gurudev Plastics offers a range of plastic household products in Bhayander. From bathroom accessories and home storage to utility items, we stock everything you need for your home at wholesale prices from Mango Chairs.",
    faqs: [
      { question: "What household products do you stock?", answer: "We stock bathroom accessories, home storage solutions, utility items, and general household plastic products." },
      { question: "Do you offer bulk pricing on household items?", answer: "Yes, we offer competitive bulk pricing on all household products. Contact us on WhatsApp for quotes." },
    ],
  },
  cabinets: {
    title: "Plastic Cabinets Bhayander | Storage Cabinets & Drawers — Wholesale Seller",
    description: "Buy plastic cabinets in Bhayander — storage cabinets, drawer units, multi-shelf cabinets from Mango Chairs (Checkmate, Spencer, Spark series). Wholesale plastic cabinet distributor in Mumbai. Best prices on bulk cabinets Bhayander.",
    keywords: ["plastic cabinets Bhayander", "storage cabinet Mumbai", "drawer unit Bhayander", "wholesale plastic cabinets", "Mango cabinets", "Checkmate cabinet", "Spencer cabinet", "plastic cabinet price"],
    about: "Shree Gurudev Plastics is the go-to plastic cabinet distributor in Bhayander. We stock storage cabinets, drawer units, and multi-shelf cabinets from Mango Chairs including the Checkmate, Spencer, and Spark series. Durable, space-saving storage at wholesale prices.",
    faqs: [
      { question: "What types of cabinets do you have?", answer: "We stock storage cabinets, drawer units, multi-shelf cabinets, and decorative cabinets in various sizes and designs." },
      { question: "Do you sell cabinets in bulk?", answer: "Yes, we offer special bulk pricing for plastic cabinets. Ideal for retailers, offices, and home furnishing shops. Contact us on WhatsApp." },
    ],
  },
  cleaning: {
    title: "Cleaning Products Bhayander | Brooms, Mops, Brushes — Wholesale Distributor",
    description: "Buy cleaning products in Bhayander — brooms, mops, brushes, toilet cleaners from Aristo. Wholesale cleaning products distributor in Mumbai. Best prices on bulk cleaning supplies Bhayander, Naigaon, Vasai.",
    keywords: ["cleaning products Bhayander", "broom Bhayander", "mop Mumbai", "plastic brush wholesale", "toilet cleaner Bhayander", "Aristo cleaning", "bulk cleaning supplies", "cleaning products price"],
    about: "Shree Gurudev Plastics stocks a complete range of cleaning products in Bhayander. From brooms and mops to brushes and toilet cleaners, we offer quality cleaning supplies from Aristo at wholesale prices for homes, offices, and commercial spaces.",
    faqs: [
      { question: "What cleaning products do you stock?", answer: "We stock brooms, mops, brushes, toilet cleaners, dusting tools, and general cleaning supplies." },
      { question: "Do you sell cleaning products in bulk?", answer: "Yes, we offer bulk pricing on all cleaning products. Ideal for retailers, hotels, and offices. Contact us on WhatsApp." },
    ],
  },
  "crates & baskets": {
    title: "Plastic Crates & Baskets Bhayander | Storage & Shopping — Wholesale",
    description: "Buy plastic crates and baskets in Bhayander — shopping baskets, storage crates, dairy crates, produce baskets from Aristo. Wholesale crates and baskets distributor in Mumbai. Best prices on bulk crates Bhayander.",
    keywords: ["plastic crates Bhayander", "shopping baskets Mumbai", "storage crates wholesale", "dairy crate Bhayander", "Aristo crates", "plastic baskets Bhayander", "bulk crates Mumbai"],
    about: "Shree Gurudev Plastics offers a range of plastic crates and baskets in Bhayander. From shopping baskets and storage crates to dairy crates and produce baskets, we stock durable storage solutions from Aristo at wholesale prices.",
    faqs: [
      { question: "What types of crates do you have?", answer: "We stock shopping baskets, storage crates, dairy crates, produce baskets, and general-purpose crates in various sizes." },
      { question: "Do you sell crates in bulk?", answer: "Yes, we offer competitive bulk pricing on all crates and baskets. Contact us on WhatsApp for quotes." },
    ],
  },
  insulated: {
    title: "Insulated Products Bhayander | Ice Boxes, Flasks, Coolers — Wholesale Seller",
    description: "Buy insulated products in Bhayander — ice boxes, flasks, coolers, water jugs from Aristo. Wholesale insulated products distributor in Mumbai. Best prices on bulk insulated items Bhayander, Naigaon, Vasai.",
    keywords: ["insulated products Bhayander", "ice box Mumbai", "flask Bhayander", "cooler wholesale", "water jug Bhayander", "Aristo insulated", "bulk insulated products", "insulated bottle price"],
    about: "Shree Gurudev Plastics stocks insulated products in Bhayander including ice boxes, flasks, coolers, and water jugs from Aristo. Perfect for picnics, events, restaurants, and daily use at wholesale prices.",
    faqs: [
      { question: "What insulated products do you stock?", answer: "We stock ice boxes, flasks, coolers, water jugs, and insulated containers in various sizes and designs." },
      { question: "Do you sell insulated products in bulk?", answer: "Yes, we offer bulk pricing on all insulated products. Ideal for retailers and event organizers. Contact us on WhatsApp." },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).toLowerCase();
  const meta = categoryMeta[decoded];
  if (!meta) {
    return { title: "Category Not Found" };
  }
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/category/${slug}`,
      siteName: BUSINESS_NAME,
      locale: "en_IN",
      type: "website",
    },
  };
}

async function getProductsByCategory(category: string) {
  try {
    const decoded = decodeURIComponent(category).toLowerCase();
    const res = await apiFetch(`/api/products?category=${encodeURIComponent(decoded)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).toLowerCase();
  const meta = categoryMeta[decoded];
  const products = await getProductsByCategory(slug);

  if (!meta) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-500 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products" className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
            Browse All Products
          </Link>
        </div>
      </main>
    );
  }

  const breadcrumbItems = [
    { label: "Products", href: "/products" },
    { label: meta.title.split("|")[0].trim() },
  ];

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: meta.title.split("|")[0].trim(), url: `/category/${slug}` },
  ]);

  const faqSchema = getFAQSchema(meta.faqs);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold text-gray-900 mb-6">{meta.title}</h1>

        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <p className="text-gray-600 leading-relaxed">{meta.about}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {products.length > 0 ? `Browse ${meta.title.split("|")[0].trim()} (${products.length} Products)` : `No Products in This Category`}
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {product.imageUrl ? (
                        <BlurImage src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex gap-2 mt-1 text-sm text-gray-500">
                      {product.color && <span>{product.color}</span>}
                      {product.size && <span>• {product.size}</span>}
                    </div>
                    <p className="text-lg font-bold text-primary-500 mt-2">₹{product.price}</p>
                    {product.brand?.name && <p className="text-xs text-gray-400 mt-1">{product.brand.name}</p>}
                    <a
                      href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Namaste!\n\nI am interested in ${product.name}. Kindly share the price and availability.\n\nThank you!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Enquire on WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No products found in this category yet. Check back soon!</p>
              <Link href="/products" className="mt-4 inline-block text-primary-500 hover:underline">Browse All Products →</Link>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions — {meta.title.split("|")[0].trim()}</h2>
          <div className="space-y-4">
            {meta.faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Need Bulk {meta.title.split("|")[0].trim()}?</h2>
          <p className="text-gray-300 mb-6">Contact {BUSINESS_NAME} for wholesale pricing on {meta.title.split("|")[0].trim().toLowerCase()} in {CITY}.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Namaste!\n\nI need bulk ${meta.title.split("|")[0].trim().toLowerCase()} for my business.\n\nKindly share the wholesale pricing and minimum order quantities.\n\nThank you!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us Now
            </a>
            <Link
              href={`/quote?category=${encodeURIComponent(slug)}`}
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Need Bulk Pricing? Request a Quote
            </Link>
          </div>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
