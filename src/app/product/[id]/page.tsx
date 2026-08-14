import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductSchema, getBreadcrumbSchema, getFAQSchema, SITE_URL, BUSINESS_NAME, CITY, PHONE } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const res = await fetch(`http://localhost:3000/api/products/${id}`, { cache: "no-store" });
  const data = await res.json();
  const product = data.product;
  if (!product) return { title: "Product Not Found" };
  const brandName = product.brand?.name || "";
  const cat = product.category || "";
  return {
    title: `${product.name} — ${brandName} ${cat} | Buy Online at ${BUSINESS_NAME}`,
    description: `Buy ${product.name} by ${brandName} at ${BUSINESS_NAME}, ${CITY}. ₹${product.price} | ${product.color || ""} ${product.size || ""} | Bulk orders available. Plastic ${cat.toLowerCase()} distributor in Bhayander, Mumbai. Free delivery on bulk orders. Best price guarantee.`,
    keywords: [product.name, brandName, cat, `${cat} Bhayander`, `buy ${product.name} online`, `${cat} distributor`, `plastic ${cat.toLowerCase()} bulk`, `${product.name} price`, `${BUSINESS_NAME}`, `plastic products ${CITY}`, `bulk plastic seller`, `wholesale ${cat.toLowerCase()}`],
    alternates: { canonical: `${SITE_URL}/product/${id}` },
    openGraph: {
      title: `${product.name} | ${BUSINESS_NAME} — ${CITY}`,
      description: `Buy ${product.name} — ₹${product.price}. Bulk orders available. ${BUSINESS_NAME}, ${CITY}.`,
      url: `${SITE_URL}/product/${id}`,
      siteName: BUSINESS_NAME,
      locale: "en_IN",
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, width: 800, height: 800, alt: product.name }] : [],
    },
  };
}

async function getProduct(id: string) {
  const res = await fetch(`http://localhost:3000/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product || null;
}

async function getRelatedProducts(brandId: number, excludeId: number, category: string) {
  const res = await fetch(`http://localhost:3000/api/products`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const products = data.products || [];
  const sameBrand = products.filter((p: any) => p.brandId === brandId && p.id !== excludeId);
  const sameCategory = products.filter((p: any) => p.category === category && p.id !== excludeId && p.brandId !== brandId);
  return [...sameBrand, ...sameCategory].slice(0, 8);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const brand = product.brand;
  const related = brand ? await getRelatedProducts(brand.id, product.id, product.category || "") : [];

  const productSchema = getProductSchema(product);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product.name, url: `/product/${product.id}` },
  ]);

  const productFaqs = [
    { question: `Is ${product.name} available in bulk?`, answer: `Yes, ${BUSINESS_NAME} offers bulk pricing on ${product.name}. Contact us on WhatsApp at +91 ${PHONE.slice(2)} for bulk order quotes and discounts.` },
    { question: `What is the delivery time for ${product.name}?`, answer: `We deliver ${product.name} across ${CITY}, Naigaon, Vasai, Virar, Mumbai, and Thane. Delivery typically takes 1-3 days depending on your location.` },
    { question: `What brand is ${product.name}?`, answer: product.brand ? `${product.name} is manufactured by ${product.brand.name}, one of the leading plastic product brands available at ${BUSINESS_NAME}.` : `${product.name} is available at ${BUSINESS_NAME}, your trusted plastic products distributor in ${CITY}.` },
    { question: `What is the price of ${product.name}?`, answer: `The price of ${product.name} is ₹${product.price}. For bulk orders, contact us for special wholesale pricing.` },
  ];
  const faqSchema = getFAQSchema(productFaqs);

  const breadcrumbItems = [
    { label: "Products", href: "/products" },
    { label: product.name },
  ];

  const categorySlug = (product.category || "").toLowerCase().replace(/\s+/g, "");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-square bg-gray-100">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>

            <div className="p-8 flex flex-col justify-center">
              {brand && (
                <Link href={`/brand/${brand.slug}`} className="text-orange-500 text-sm font-medium hover:underline mb-2">
                  {brand.name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="space-y-2 mb-6">
                {product.color && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-20">Color</span>
                    <span className="text-gray-900 text-sm font-medium">{product.color}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-20">Size</span>
                    <span className="text-gray-900 text-sm font-medium">{product.size}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-20">Category</span>
                    <Link href={`/category/${categorySlug}`} className="text-orange-500 text-sm font-medium hover:underline">{product.category}</Link>
                  </div>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
              )}

              <p className="text-3xl font-bold text-orange-500 mb-2">₹{product.price}</p>
              <p className="text-gray-500 text-sm mb-4">Inclusive of all taxes. Bulk pricing available.</p>

              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    In Stock — Ready to Ship
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Out of Stock
                  </span>
                )}
              </div>

              <a
                href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}. Please share details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enquire on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {product.brand && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Brand:</span>
                <Link href={`/brand/${brand.slug}`} className="text-orange-500 hover:underline">{product.brand.name}</Link>
              </div>
            )}
            {product.color && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Color:</span>
                <span className="text-gray-900">{product.color}</span>
              </div>
            )}
            {product.size && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Size:</span>
                <span className="text-gray-900">{product.size}</span>
              </div>
            )}
            {product.category && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Category:</span>
                <Link href={`/category/${categorySlug}`} className="text-orange-500 hover:underline">{product.category}</Link>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Product</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Buy {product.name} from {BUSINESS_NAME}, Bhayander&apos;s trusted plastic products distributor.
            {brand ? ` This is a ${brand.name} brand product` : ""}.
            {product.stock > 0 ? " Currently in stock and ready to ship." : " Contact us for availability."}
            We offer bulk pricing for retailers and businesses. Serving {CITY}, Naigaon, Vasai, Virar, Mumbai, and Thane.
          </p>
        </section>

        <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {productFaqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rp: any) => (
                <div key={rp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/product/${rp.id}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {rp.imageUrl ? (
                        <Image src={rp.imageUrl} alt={rp.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${rp.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1">{rp.name}</h3>
                    </Link>
                    <div className="flex gap-2 mt-1 text-sm text-gray-500">
                      {rp.color && <span>{rp.color}</span>}
                      {rp.size && <span>• {rp.size}</span>}
                    </div>
                    <p className="text-lg font-bold text-orange-500 mt-2">₹{rp.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {product.category && (
          <section className="mt-8 text-center">
            <Link href={`/category/${categorySlug}`} className="text-orange-500 hover:underline font-medium">
              Browse More {product.category} Products →
            </Link>
          </section>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
