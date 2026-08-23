import type { Metadata } from "next";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import ProductCartSection from "@/components/ProductCartSection";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import PincodeCheck from "@/components/PincodeCheck";
import ProductTags from "@/components/ProductTags";
import TrackRecentlyViewed from "@/components/TrackRecentlyViewed";
import { getColorNames } from "@/lib/product-helpers";
import ReviewList from "@/components/ReviewList";
import { getProductSchema, getBreadcrumbSchema, getFAQSchema, SITE_URL, BUSINESS_NAME, CITY, PHONE } from "@/lib/seo";
import ProductHeroSection from "@/components/ProductHeroSection";
import DynamicColor from "@/components/DynamicColor";
import { db } from "@/lib/db";
import { Suspense } from "react";

async function getProduct(slugOrId: string) {
  try {
    // Try slug first (for new URLs like /product/mango-chairs-bidai)
    let product = await db.product.findUnique({
      where: { slug: slugOrId },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { approved: true }, select: { rating: true, approved: true } } },
    });
    if (product) return product;

    // Fallback: try numeric ID (for old URLs like /product/505)
    const numId = parseInt(slugOrId);
    if (!isNaN(numId)) {
      product = await db.product.findUnique({
        where: { id: numId },
        include: { brand: true, images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { approved: true }, select: { rating: true, approved: true } } },
      });
    }
    return product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    if (!product) return { title: "Product Not Found" };
    const brandName = product.brand?.name || "";
    const cat = product.category || "";
    return {
      title: `${product.name} — ${brandName} ${cat} | Buy Online at ${BUSINESS_NAME}`,
      description: `Buy ${product.name} by ${brandName} at ${BUSINESS_NAME}, ${CITY}. ₹${product.price} | ${product.color || ""} ${product.size || ""} | Bulk orders available. Plastic ${cat.toLowerCase()} distributor in Bhayander, Mumbai. Free delivery on bulk orders. Best price guarantee.`,
      keywords: [product.name, brandName, cat, `${cat} Bhayander`, `buy ${product.name} online`, `${cat} distributor`, `plastic ${cat.toLowerCase()} bulk`, `${product.name} price`, `${BUSINESS_NAME}`, `plastic products ${CITY}`, `bulk plastic seller`, `wholesale ${cat.toLowerCase()}`],
      alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
      openGraph: {
        title: `${product.name} | ${BUSINESS_NAME} — ${CITY}`,
        description: `Buy ${product.name} — ₹${product.price}. Bulk orders available. ${BUSINESS_NAME}, ${CITY}.`,
        url: `${SITE_URL}/product/${product.slug}`,
        siteName: BUSINESS_NAME,
        locale: "en_IN",
        type: "website",
        images: product.imageUrl ? [{ url: product.imageUrl, width: 800, height: 800, alt: product.name }] : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

async function getRelatedProducts(brandId: number, excludeId: number, category: string) {
  try {
    const sameBrand = await db.product.findMany({
      where: { brandId, id: { not: excludeId }, isActive: true },
      include: { brand: true },
      take: 4,
    });
    const sameCategory = await db.product.findMany({
      where: { category, id: { not: excludeId }, brandId: { not: brandId }, isActive: true },
      include: { brand: true },
      take: 4,
    });
    return [...sameBrand, ...sameCategory].slice(0, 8);
  } catch {
    return [];
  }
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
          <Link href="/" className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
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
    { name: product.name, url: `/product/${product.slug}` },
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

  const categorySlug = encodeURIComponent(product.category || "");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <ProductHeroSection
            product={product}
            brand={brand}
            colorCount={getColorNames(product.images, product.name).length}
          />
        </div>

        <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {product.brand && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Brand:</span>
                <Link href={`/brand/${brand.slug}`} className="text-primary-500 hover:underline">{product.brand.name}</Link>
              </div>
            )}
            {product.color && (
              <Suspense>
                <DynamicColor fallback={product.color} />
              </Suspense>
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
                <Link href={`/products?category=${categorySlug}`} className="text-primary-500 hover:underline">{product.category}</Link>
              </div>
            )}
            {product.height && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Height:</span>
                <span className="text-gray-900">{product.height} cm</span>
              </div>
            )}
            {product.width && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Width:</span>
                <span className="text-gray-900">{product.width} cm</span>
              </div>
            )}
            {product.depth && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Depth:</span>
                <span className="text-gray-900">{product.depth} cm</span>
              </div>
            )}
            {product.weight && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Weight:</span>
                <span className="text-gray-900">{product.weight} kg</span>
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

        <section className="mt-8">
          <ReviewList productId={product.id} />
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rp: any) => (
                <div key={rp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/product/${rp.slug}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {rp.imageUrl ? (
                        <BlurImage src={rp.imageUrl} alt={rp.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${rp.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">{rp.name}</h3>
                    </Link>
                    <div className="flex gap-2 mt-1 text-sm text-gray-500">
                      {rp.color && <span>{rp.color}</span>}
                      {rp.size && <span>• {rp.size}</span>}
                    </div>
                    <p className="text-lg font-bold text-primary-500 mt-2">₹{rp.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {product.category && (
          <section className="mt-8 text-center">
            <Link href={`/products?category=${categorySlug}`} className="text-primary-500 hover:underline font-medium">
              Browse More {product.category} Products →
            </Link>
          </section>
        )}

        <TrackRecentlyViewed
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl || "",
            price: product.price,
            color: product.color || "",
            size: product.size || "",
            brand: brand?.name,
          }}
        />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
