import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBreadcrumbSchema, getFAQSchema, SITE_URL, BUSINESS_NAME, CITY, LOCATION_KEYWORDS } from "@/lib/seo";

const categoryMeta: Record<string, { title: string; description: string; keywords: string[]; about: string; faqs: { question: string; answer: string }[] }> = {
  furniture: {
    title: "Plastic Furniture Bhayander | Chairs, Tables, Stools — Bulk Seller",
    description: "Buy premium plastic furniture in Bhayander — chairs, tables, stools, and more from top brands like Aristo, KG Plast, Mango Chairs. Bulk orders available. Wholesale plastic furniture distributor in Mumbai area. Best prices on plastic chairs Bhayander, plastic tables Naigaon, plastic stools Vasai.",
    keywords: ["plastic chairs Bhayander", "plastic tables Bhayander", "plastic stools Bhayander", "plastic furniture Mumbai", "wholesale plastic chairs", "bulk plastic tables", "plastic furniture distributor", "buy plastic chairs online", "plastic chair price", "plastic table price", "Aristo chairs", "KG Plast furniture", "Mango Chairs"],
    about: "Shree Gurudev Plastics is Bhayander's leading plastic furniture distributor. We stock a wide range of plastic chairs, tables, stools, and garden furniture from trusted brands like Aristo, KG Plast, Mango Chairs, and Rajdhani. Whether you need a single chair or bulk furniture for an event, we offer the best wholesale prices in the Bhayander, Naigaon, Vasai, and Mumbai area. Our collection includes dining chairs, folding chairs, monoblock chairs, plastic tables, center tables, and more.",
    faqs: [
      { question: "Do you offer bulk discounts on plastic chairs?", answer: "Yes, Shree Gurudev Plastics offers competitive bulk pricing on all plastic furniture. Contact us on WhatsApp at +91 85520 84251 for bulk order quotes." },
      { question: "What brands of plastic furniture do you stock?", answer: "We stock Aristo, KG Plast, Mango Chairs, Rajdhani, Cosmos, and other leading plastic furniture brands at our Bhayander store." },
      { question: "Do you deliver plastic furniture in Mumbai?", answer: "Yes, we deliver plastic furniture across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar. Contact us for delivery details." },
      { question: "What is the price range of plastic chairs?", answer: "Our plastic chairs start from ₹300 and go up to ₹3,000 depending on the brand, design, and quality. We have options for every budget." },
    ],
  },
  containers: {
    title: "Plastic Containers Bhayander | Storage & Kitchen Containers — Bulk Seller",
    description: "Shop plastic containers in Bhayander — storage containers, kitchen containers, tiffin boxes, water bottles from Milton, Borosil, Signoraware. Wholesale plastic containers distributor in Mumbai. Best prices on bulk plastic containers Bhayander, Naigaon, Vasai. Durable and quality plastic containers.",
    keywords: ["plastic containers Bhayander", "storage containers Bhayander", "kitchen containers Bhayander", "plastic boxes Bhayander", "wholesale plastic containers", "bulk plastic containers Mumbai", "Milton containers", "Borosil containers", "plastic container price", "plastic tiffin box", "water bottles Bhayander"],
    about: "Shree Gurudev Plastics is the go-to plastic container distributor in Bhayander. We offer a comprehensive range of plastic containers including storage containers, kitchen containers, tiffin boxes, water bottles, and food storage solutions from brands like Milton, Borosil, Signoraware, and more. Our containers are durable, food-safe, and available at wholesale prices for both retail and bulk buyers across Mumbai.",
    faqs: [
      { question: "Do you sell plastic containers in bulk?", answer: "Yes, we are a wholesale plastic container distributor. We offer bulk pricing for retailers, restaurants, caterers, and businesses. Contact us on WhatsApp for quotes." },
      { question: "What brands of containers do you have?", answer: "We stock Milton, Borosil, Signoraware, and other top brands for plastic containers, water bottles, and kitchen storage solutions." },
      { question: "Are your plastic containers food-safe?", answer: "Yes, all our kitchen and food storage containers are made from food-grade materials and are completely safe for storing food items." },
      { question: "Do you deliver containers in Mumbai?", answer: "Yes, we deliver across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar. Minimum order may apply for bulk deliveries." },
    ],
  },
  storage: {
    title: "Plastic Storage Bhayander | Boxes, Crates, Organizers — Bulk Wholesale",
    description: "Buy plastic storage products in Bhayander — storage boxes, crates, organizers, baskets at wholesale prices. Leading plastic storage distributor in Mumbai area. Affordable bulk plastic storage solutions for homes, offices, and businesses in Bhayander, Naigaon, Vasai.",
    keywords: ["plastic storage Bhayander", "plastic boxes Bhayander", "plastic crates Bhayander", "storage baskets Bhayander", "wholesale plastic storage", "bulk plastic boxes Mumbai", "plastic organizer", "plastic drawer", "storage solutions Bhayander", "plastic storage wholesale"],
    about: "Shree Gurudev Plastics offers the best range of plastic storage solutions in Bhayander. From storage boxes and crates to baskets, organizers, and drawer units, we have everything to keep your space tidy. As a leading plastic storage distributor, we cater to homes, offices, shops, and warehouses across Bhayander, Naigaon, Vasai, Virar, and Mumbai with competitive bulk pricing.",
    faqs: [
      { question: "Do you offer bulk storage box pricing?", answer: "Yes, we offer special bulk pricing for storage boxes, crates, and organizers. Ideal for retailers, offices, and warehouses. Contact us on WhatsApp for quotes." },
      { question: "What sizes of plastic boxes do you have?", answer: "We stock small, medium, large, and extra-large plastic storage boxes in various designs and colors to suit different needs." },
      { question: "Can I buy storage products for my shop?", answer: "Absolutely. We are a wholesale distributor and supply storage products to retail shops across Bhayander, Mumbai, and surrounding areas." },
    ],
  },
  kitchen: {
    title: "Plastic Kitchenware Bhayander | Kitchen Products — Wholesale Distributor",
    description: "Shop plastic kitchenware in Bhayander — mugs, jugs, plates, glasses, spoons, containers at wholesale prices. Top kitchen products distributor in Mumbai. Buy plastic kitchen items in bulk from Shree Gurudev Plastics, Bhayander. Best prices on kitchen essentials.",
    keywords: ["plastic kitchenware Bhayander", "plastic mugs Bhayander", "plastic jugs Bhayander", "plastic plates Bhayander", "wholesale kitchen products", "bulk plastic kitchenware Mumbai", "plastic glasses", "plastic spoons", "kitchen accessories Bhayander", "plastic kitchen distributor"],
    about: "Shree Gurudev Plastics is Bhayander's trusted plastic kitchenware distributor. We offer a complete range of plastic kitchen products including mugs, jugs, plates, glasses, spoons, containers, and more. Whether you're setting up a new kitchen or stocking your retail shop, our wholesale prices on quality kitchenware make us the preferred choice across Bhayander, Naigaon, Vasai, and Mumbai.",
    faqs: [
      { question: "Do you sell kitchenware in bulk?", answer: "Yes, we are a wholesale plastic kitchenware distributor. We offer bulk pricing for retailers, restaurants, hostels, and canteens. Contact us for quotes." },
      { question: "What kitchen products do you stock?", answer: "We stock mugs, jugs, bottles, plates, glasses, spoons, containers, tiffin boxes, water bottles, and a wide range of kitchen accessories." },
      { question: "Are your products food-grade?", answer: "Yes, all our kitchenware products are made from food-grade, BPA-free plastic materials safe for daily kitchen use." },
    ],
  },
  accessories: {
    title: "Plastic Accessories Bhayander | Buckets, Mugs, Baskets — Wholesale Seller",
    description: "Buy plastic accessories in Bhayander — buckets, mugs, baskets, trays, dustbins at wholesale prices. Leading plastic accessories distributor in Mumbai. Bulk plastic household items from Shree Gurudev Plastics. Best prices in Bhayander, Naigaon, Vasai.",
    keywords: ["plastic buckets Bhayander", "plastic mugs Bhayander", "plastic baskets Bhayander", "plastic trays Bhayander", "wholesale plastic accessories", "bulk plastic buckets Mumbai", "plastic dustbin", "plastic hangers", "household plastic items", "plastic accessories distributor"],
    about: "Shree Gurudev Plastics offers a wide range of plastic accessories and household items in Bhayander. From buckets and mugs to baskets, trays, dustbins, and hangers, we stock everything you need for your home or business. As a leading plastic accessories distributor, we provide wholesale pricing to retailers and bulk buyers across Bhayander, Naigaon, Vasai, Virar, and Mumbai.",
    faqs: [
      { question: "Do you sell plastic buckets in bulk?", answer: "Yes, we are a wholesale plastic bucket supplier. We offer bulk pricing for retailers and businesses. Contact us on WhatsApp for the best rates." },
      { question: "What plastic accessories do you stock?", answer: "We stock buckets, mugs, jugs, baskets, trays, dustbins, hangers, soap cases, and a wide range of plastic household accessories." },
      { question: "Do you supply to shops?", answer: "Yes, we are a wholesale distributor and supply plastic accessories to retail shops, supermarkets, and general stores across the Mumbai region." },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = categoryMeta[slug];
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
  const categoryMap: Record<string, string> = {
    furniture: "Furniture",
    containers: "Containers",
    storage: "Storage",
    kitchen: "Kitchen",
    accessories: "Accessories",
  };
  const apiCategory = categoryMap[category] || category;
  const res = await fetch(`http://localhost:3000/api/products?category=${apiCategory}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = categoryMeta[slug];
  const products = await getProductsByCategory(slug);

  if (!meta) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-500 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Go Home
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
                  <Link href={`/product/${product.id}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex gap-2 mt-1 text-sm text-gray-500">
                      {product.color && <span>{product.color}</span>}
                      {product.size && <span>• {product.size}</span>}
                    </div>
                    <p className="text-lg font-bold text-orange-500 mt-2">₹{product.price}</p>
                    {product.brand?.name && <p className="text-xs text-gray-400 mt-1">{product.brand.name}</p>}
                    <a
                      href={`https://wa.me/918552084251?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}`)}`}
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
              <Link href="/products" className="mt-4 inline-block text-orange-500 hover:underline">Browse All Products →</Link>
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
              href={`https://wa.me/918552084251?text=${encodeURIComponent(`Hi, I need bulk ${meta.title.split("|")[0].trim().toLowerCase()}`)}`}
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
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors"
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
