"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { useCart } from "@/context/CartContext";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";

export default function ProductsPage() {
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [userMin, setUserMin] = useState(0);
  const [userMax, setUserMax] = useState(0);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

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
    if (sort) params.set("sort", sort);
    if (userMin > 0) params.set("minPrice", String(userMin));
    if (userMax > 0 && userMax < sliderMax) params.set("maxPrice", String(userMax));
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
        if (data.priceRange) {
          setSliderMin(data.priceRange.min);
          setSliderMax(data.priceRange.max);
          setPriceRange([data.priceRange.min, data.priceRange.max]);
          if (userMin === 0 && userMax === 0) {
            setUserMin(data.priceRange.min);
            setUserMax(data.priceRange.max);
          }
        }
        if (data.categories) setDbCategories(data.categories);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [search, selectedBrand, selectedCategory, sort, page, userMin, userMax, sliderMax]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedBrand, selectedCategory, sort]);

  const handlePriceApply = () => {
    const minVal = minRef.current ? parseFloat(minRef.current.value) || 0 : 0;
    const maxVal = maxRef.current ? parseFloat(maxRef.current.value) || 0 : 0;
    setUserMin(minVal);
    setUserMax(maxVal);
    setPage(1);
  };

  const resetPrice = () => {
    setUserMin(sliderMin);
    setUserMax(sliderMax);
    if (minRef.current) minRef.current.value = String(sliderMin);
    if (maxRef.current) maxRef.current.value = String(sliderMax);
    setPage(1);
  };

  const resetAll = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSort("newest");
    setUserMin(0);
    setUserMax(0);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayCategories = dbCategories.length > 0 ? dbCategories : ["Furniture", "Containers", "Storage", "Kitchen", "Accessories", "General"];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-sm text-gray-500">{pagination.total} products found</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 md:max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Brands</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedBrand("")}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${!selectedBrand ? "bg-primary-100 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    All Brands
                  </button>
                </li>
                {brands.map((brand: any) => (
                  <li key={brand.id}>
                    <button
                      onClick={() => setSelectedBrand(brand.slug || brand.name)}
                      className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${selectedBrand === (brand.slug || brand.name) ? "bg-primary-100 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
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
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${!selectedCategory ? "bg-primary-100 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    All Categories
                  </button>
                </li>
                {displayCategories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${selectedCategory === cat ? "bg-primary-100 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="font-bold text-gray-900 mt-6 mb-3">Price Range</h3>
              <div className="space-y-3">
                {sliderMin < sliderMax && (
                  <div className="relative pt-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">₹{Math.round(sliderMin)}</span>
                      <div className="flex-1 h-1 bg-gray-200 rounded relative">
                        <div
                          className="absolute h-1 bg-primary-400 rounded"
                          style={{
                            left: `${((priceRange[0] - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                            right: `${100 - ((priceRange[1] - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">₹{Math.round(sliderMax)}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.floor(sliderMin)}
                      max={Math.ceil(sliderMax)}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
                      }}
                      onMouseUp={() => { setUserMin(priceRange[0]); setUserMax(priceRange[1]); setPage(1); }}
                      onTouchEnd={() => { setUserMin(priceRange[0]); setUserMax(priceRange[1]); setPage(1); }}
                      className="w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0"
                    />
                    <input
                      type="range"
                      min={Math.floor(sliderMin)}
                      max={Math.ceil(sliderMax)}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
                      }}
                      onMouseUp={() => { setUserMin(priceRange[0]); setUserMax(priceRange[1]); setPage(1); }}
                      onTouchEnd={() => { setUserMin(priceRange[0]); setUserMax(priceRange[1]); setPage(1); }}
                      className="w-full h-1 appearance-none bg-transparent cursor-pointer -mt-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={minRef}
                    type="number"
                    placeholder={`Min ₹${Math.round(sliderMin)}`}
                    defaultValue={sliderMin}
                    className="w-1/2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    ref={maxRef}
                    type="number"
                    placeholder={`Max ₹${Math.round(sliderMax)}`}
                    defaultValue={sliderMax}
                    className="w-1/2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handlePriceApply}
                  className="w-full text-sm bg-primary-500 text-white py-1.5 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Apply Price
                </button>
                <button
                  onClick={resetPrice}
                  className="w-full text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset Price
                </button>
              </div>

              <button
                onClick={resetAll}
                className="mt-6 w-full text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Reset All Filters
              </button>
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
                              brand: product.brand?.name,
                            }}
                          />
                        </div>
                        <div className="flex gap-2 mt-1 text-sm text-gray-500">
                          {product.color && <span>{product.color}</span>}
                          {product.size && <span>• {product.size}</span>}
                        </div>
                        <p className="text-lg font-bold text-primary-500 mt-2">₹{product.price}</p>
                        {product.brand?.name && <p className="text-xs text-gray-400 mt-1">{product.brand.name}</p>}
                        {product.moq > 1 && (
                          <span className="inline-block mt-1 text-[10px] font-semibold bg-primary-500 text-white px-1.5 py-0.5 rounded">MOQ: {product.moq}</span>
                        )}
                        <button
                          onClick={() => {
                            addItem({
                              id: product.id,
                              name: product.name,
                              color: product.color || "",
                              size: product.size || "",
                              price: product.price,
                              imageUrl: product.imageUrl || "",
                              brand: product.brand?.name,
                              moq: product.moq || 1,
                            });
                            openCart();
                          }}
                          className="mt-3 block w-full text-center bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          Add to Cart
                        </button>
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
                                ? "bg-primary-500 text-white"
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
