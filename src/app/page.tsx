import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Home",
  description: "Shop premium plastic products from Shree Gurudev Plastics. Browse chairs, tables, buckets, containers from trusted brands — Aristo, KG Plast, Mango Chairs.",
  openGraph: { title: "Shree Gurudev Plastics | Premium Plastic Products", description: "Shop premium plastic products from Shree Gurudev Plastics." },
};

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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Shree Gurudev Plastics</h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-8">Premium Plastic Products for Every Need</p>
          <Link
            href="/products"
            className="inline-block bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors"
          >
            View Products
          </Link>
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-gray-700">
          {[
            { value: "500+", label: "Products" },
            { value: "3", label: "Trusted Brands" },
            { value: "1000+", label: "Happy Customers" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Brands</h2>
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

      <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Products</h2>
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
        <div className="text-center mt-10">
          <Link href="/products" className="inline-block bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            View All Products
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-3">Shree Gurudev Plastics</h3>
            <p className="text-sm leading-relaxed">Premium plastic products for every need. Trusted by thousands of happy customers.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-3">Contact</h3>
            <a
              href="https://wa.me/918552084251"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors text-sm"
            >
              WhatsApp: +91 85520 84251
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} Shree Gurudev Plastics. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
