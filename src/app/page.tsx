import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE_URL, BUSINESS_NAME, CITY, PHONE, getFAQSchema } from "@/lib/seo";
import AddToCartButton from "@/components/AddToCartButton";
import CompareButton from "@/components/CompareButton";

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
  const res = await fetch("http://localhost:3000/api/brands", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.brands || [];
}

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

const productCategories = [
  { name: "Plastic Furniture", slug: "furniture", desc: "Chairs, tables, stools, and more" },
  { name: "Plastic Containers", slug: "containers", desc: "Storage & kitchen containers" },
  { name: "Plastic Storage", slug: "storage", desc: "Boxes, crates, organizers" },
  { name: "Plastic Kitchenware", slug: "kitchen", desc: "Mugs, jugs, plates, glasses" },
  { name: "Plastic Accessories", slug: "accessories", desc: "Buckets, baskets, trays" },
];

export default async function Home() {
  const brands = await getBrands();
  const allProducts = await getProducts();
  const featured = allProducts.slice(0, 8);

  return (
    <main className="min-h-screen">
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Premium Plastic Products | Bulk Seller & Distributor in {CITY}
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-4">
            {BUSINESS_NAME} — Bhayander&apos;s trusted wholesale plastic products distributor
          </p>
          <p className="text-orange-200 mb-8 max-w-2xl mx-auto">
            Plastic chairs, tables, buckets, containers, and more from top brands.
            Serving {CITY}, Naigaon, Vasai, Virar, Mumbai, and Thane.
            Best wholesale prices on bulk plastic products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-block bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              View Products
            </Link>
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'm interested in bulk plastic products")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Get Bulk Quote
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "500+", label: "Products" },
            { value: "10+", label: "Trusted Brands" },
            { value: "1000+", label: "Happy Customers" },
            { value: "7+", label: "Cities Served" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Product Categories</h2>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Browse our wide range of plastic products. As a leading distributor in {CITY}, we offer everything from furniture to storage and kitchenware.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{cat.name}</h3>
              <p className="text-gray-500 mt-2 text-sm">{cat.desc}</p>
              <span className="inline-block mt-4 text-orange-500 font-medium group-hover:underline">Browse Collection →</span>
            </Link>
          ))}
          <Link
            href="/products"
            className="block bg-orange-50 border border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <h3 className="text-xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">All Products</h3>
            <p className="text-gray-500 mt-2 text-sm">Browse our complete catalog of 500+ plastic products</p>
            <span className="inline-block mt-4 text-orange-500 font-medium group-hover:underline">View All →</span>
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why Choose {BUSINESS_NAME}?</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            As Bhayander&apos;s premier plastic products distributor, we offer unmatched value on bulk and retail orders.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Wholesale Prices", desc: "As a bulk distributor, we offer the best wholesale prices on all plastic products. Save more when you buy in bulk from us." },
              { title: "Top Brands Only", desc: "We stock only trusted brands — Aristo, KG Plast, Mango Chairs, Rajdhani, Milton, Borosil, and more. Quality guaranteed." },
              { title: "Wide Delivery Area", desc: "We deliver across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, and Palghar. Fast and reliable delivery." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Brands</h2>
          <p className="text-gray-600 text-center mb-8">
            We are authorized distributors for top plastic product brands in {CITY}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brands.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
              >
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{brand.name}</h3>
                <p className="text-gray-500 mt-2">{brand._count?.products ?? 0} Products</p>
                <span className="inline-block mt-4 text-orange-500 font-medium group-hover:underline">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Featured Products</h2>
          <p className="text-gray-600 text-center mb-8">
            Top-selling plastic products from {BUSINESS_NAME}. Buy online or contact us for bulk orders.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product: any) => (
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
                  <AddToCartButton
                    id={product.id}
                    name={product.name}
                    color={product.color || ""}
                    size={product.size || ""}
                    price={product.price}
                    imageUrl={product.imageUrl || ""}
                    brand={product.brand?.name}
                  />
                  <CompareButton
                    product={{
                      id: product.id,
                      name: product.name,
                      color: product.color || "",
                      size: product.size || "",
                      price: product.price,
                      imageUrl: product.imageUrl || "",
                      brand: product.brand?.name,
                      stock: product.stock ?? 0,
                      category: product.category || "",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/products" className="inline-block bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
              View All Products
            </Link>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Serving {CITY} & Nearby Areas</h2>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          {BUSINESS_NAME} is your local plastic products distributor in {CITY}. We serve customers across the Mumbai metropolitan region.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Bhayander", "Naigaon", "Vasai", "Virar", "Mumbai", "Thane", "Palghar", "Boisar"].map((area) => (
            <div key={area} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <span className="text-gray-900 font-medium">{area}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {homeFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order Plastic Products in Bulk?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {BUSINESS_NAME} offers the best wholesale prices on plastic chairs, tables, buckets, containers, and more.
            Contact us on WhatsApp for instant quotes and fast delivery across {CITY} and Mumbai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to get a bulk quote for plastic products.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Get Bulk Quote on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-block bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors"
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
