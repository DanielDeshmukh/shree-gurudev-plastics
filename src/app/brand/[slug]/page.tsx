import type { Metadata } from "next";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import AddToCartButton from "@/components/AddToCartButton";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetch("/api/brands", { cache: "no-store" });
  const data = await res.json();
  const brands = data.brands || [];
  const brand = brands.find((b: any) => b.slug === slug || b.name.toLowerCase().replace(/\s+/g, "-") === slug);
  if (!brand) return { title: "Brand Not Found" };
  return {
    title: brand.name,
    description: `Browse ${brand.name} plastic products at Shree Gurudev Plastics. Quality chairs, tables, and more.`,
    openGraph: { title: `${brand.name} | Shree Gurudev Plastics`, description: `Browse ${brand.name} plastic products.` },
  };
}

async function getBrand(slug: string) {
  const res = await fetch("/api/brands", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const brands = data.brands || [];
  return brands.find((b: any) => b.slug === slug || b.name.toLowerCase().replace(/\s+/g, "-") === slug) || null;
}

async function getProductsByBrand(slug: string) {
  const res = await fetch(`/api/products?brand=${slug}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  const products = await getProductsByBrand(slug);

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
                <Link href={`/product/${product.id}`}>
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
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <WishlistButton
                      product={{
                        id: product.id,
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
                  <p className="text-lg font-bold text-primary-500 mt-2">₹{product.price}</p>
                  {product.moq > 1 && (
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-primary-500 text-white px-1.5 py-0.5 rounded">MOQ: {product.moq}</span>
                  )}
                  <AddToCartButton
                    id={product.id}
                    name={product.name}
                    color={product.color || ""}
                    size={product.size || ""}
                    price={product.price}
                    imageUrl={product.imageUrl || ""}
                    brand={brand?.name}
                    moq={product.moq}
                  />
                  <CompareButton
                    product={{
                      id: product.id,
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
