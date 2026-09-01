import type { Metadata } from "next";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import AddToCartButton from "@/components/AddToCartButton";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";
import { apiFetch } from "@/lib/api-fetch";
import { PHONE } from "@/lib/seo";
import { getTierPrice, getTierDiscount } from "@/lib/pricing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiFetch("/api/brands");
  const data = await res.json();
  const brands = data.brands || [];
  const brand = brands.find((b: any) => b.slug === slug || b.name.toLowerCase().replace(/\s+/g, "-") === slug);
  const brandName = brand?.name || KNOWN_BRANDS[slug]?.name;
  if (!brandName) return { title: "Brand Not Found" };
  return {
    title: brandName,
    description: `Browse ${brandName} plastic products at Shree Gurudev Plastics. Quality chairs, tables, and more.`,
    openGraph: { title: `${brandName} | Shree Gurudev Plastics`, description: `Browse ${brandName} plastic products.` },
  };
}

async function getBrand(slug: string) {
  try {
    const res = await apiFetch("/api/brands");
    if (!res.ok) return null;
    const data = await res.json();
    const brands = data.brands || [];
    return brands.find((b: any) => b.slug === slug || b.name.toLowerCase().replace(/\s+/g, "-") === slug) || null;
  } catch {
    return null;
  }
}

async function getProductsByBrand(slug: string) {
  try {
    const res = await apiFetch(`/api/products?brand=${slug}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

const ACTIVE_BRAND_SLUGS = ["mango-chairs", "aristo"];

const KNOWN_BRANDS: Record<string, { name: string }> = {
  "aristo": { name: "Aristo" },
  "mango-chairs": { name: "Mango Chairs" },
  "reego": { name: "Reego" },
};

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let brand = await getBrand(slug);

  // Fallback to known brands if not in database
  if (!brand && KNOWN_BRANDS[slug]) {
    brand = { name: KNOWN_BRANDS[slug].name, slug, _count: { products: 0 } };
  }

  if (!brand) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
          <p className="text-gray-500 mb-6">The brand you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const isActiveBrand = ACTIVE_BRAND_SLUGS.includes(slug);

  if (!isActiveBrand) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{brand.name}</span>
          </nav>

          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{brand.name}</h1>
            <p className="text-xl text-gray-500 mb-2">Coming Soon</p>
            <p className="text-gray-400 max-w-md mb-8">
              We&apos;re bringing {brand.name} products to Shree Gurudev Plastics. Stay tuned for wholesale pricing and bulk orders.
            </p>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Browse Mango Products
              </Link>
              <a
                href={`https://wa.me/${PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const products = await getProductsByBrand(slug);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{brand.name}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.name}</h1>
        <p className="text-gray-500 mb-8">{brand._count?.products ?? 0} Products</p>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products found for this brand.</p>
          </div>
        ) : (
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
                  <ProductTags tags={product.tags || ""} />
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <WishlistButton
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
                  <div className="flex gap-2 mt-1 text-sm text-gray-500">
                    {product.color && <span>{product.color}</span>}
                    {product.size && <span>• {product.size}</span>}
                  </div>
                   <p className="text-lg font-bold text-primary-500 mt-2">
                     {(() => {
                       const individualPrice = getTierPrice(product, "individual");
                       const individualDiscount = getTierDiscount(product, individualPrice);
                       if (individualDiscount > 0) {
                         return (
                           <span className="flex items-center gap-1.5">
                             <span className="line-through text-gray-400 text-sm">{"\u20B9"}{product.price.toLocaleString("en-IN")}</span>
                             {"\u20B9"}{individualPrice.toLocaleString("en-IN")}
                             <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{individualDiscount}% Off</span>
                           </span>
                         );
                       }
                       return `{"\u20B9"}${product.price.toLocaleString("en-IN")}`;
                     })()}
                   </p>
                  <AddToCartButton
                    id={product.id}
                    name={product.name}
                    color={product.color || ""}
                    size={product.size || ""}
                    price={product.price}
                    mrp={product.price}
                    retailerPrice={product.retailerPrice || 0}
                    dealerPrice={product.dealerPrice || 0}
                    distributorPrice={product.distributorPrice || 0}
                    bulkPrice={product.bulkPrice || 0}
                    imageUrl={product.imageUrl || ""}
                    brand={brand?.name}
                    stock={product.stock}
                  />
                  <CompareButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      color: product.color || "",
                      size: product.size || "",
                      price: product.price,
                      imageUrl: product.imageUrl || "",
                      brand: brand?.name,
                      stock: product.stock ?? 0,
                      category: product.category || "",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
