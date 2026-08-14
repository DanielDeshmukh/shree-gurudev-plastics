"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const categories = ["Furniture", "Containers", "Storage", "Kitchen", "Accessories", "General"];
  const LIMIT = 24;

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => setBrands([]));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [search, selectedBrand, selectedCategory, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedBrand, selectedCategory]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-sm text-gray-500">{pagination.total} products found</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Brands</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedBrand("")}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${!selectedBrand ? "bg-orange-100 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    All Brands
                  </button>
                </li>
                {brands.map((brand: any) => (
                  <li key={brand.id}>
                    <button
                      onClick={() => setSelectedBrand(brand.slug || brand.name)}
                      className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${selectedBrand === (brand.slug || brand.name) ? "bg-orange-100 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="font-bold text-gray-900 mt-6 mb-3">Category</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${!selectedCategory ? "bg-orange-100 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${selectedCategory === cat ? "bg-orange-100 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">No products found.</p>
                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && typeof arr[i - 1] === "number" && p - (arr[i - 1] as number) > 1) {
                          acc.push("...");
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        typeof p === "string" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              page === p
                                ? "bg-orange-500 text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.totalPages}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
