"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import BlurImage from "@/components/BlurImage";
import { useCart } from "@/context/CartContext";
import CompareButton from "@/components/CompareButton";
import WishlistButton from "@/components/WishlistButton";
import ProductTags from "@/components/ProductTags";
import { useLanguage } from "@/context/LanguageContext";

type CategoryHierarchy = { name: string; subCategories: string[] };

function FilterSidebar({
  brands,
  selectedBrand,
  setSelectedBrand,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  sliderMin,
  sliderMax,
  priceRange,
  setPriceRange,
  minRef,
  maxRef,
  handlePriceApply,
  resetPrice,
  resetAll,
  t,
}: any) {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleExpand = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-6 overflow-y-auto">
      <div>
        <h3 className="font-bold text-gray-900 mb-3">{t("Brands", "ब्रांड")}</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => { setSelectedBrand(""); setSelectedCategory(""); setSelectedSubCategory(""); }}
              className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                !selectedBrand
                  ? "bg-primary-100 text-primary-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("All Brands", "सभी ब्रांड")}
            </button>
          </li>
          {brands.map((brand: any) => (
            <li key={brand.id}>
              <button
                onClick={() => { setSelectedBrand(brand.slug || brand.name); setSelectedCategory(""); setSelectedSubCategory(""); }}
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedBrand === (brand.slug || brand.name)
                    ? "bg-primary-100 text-primary-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">{t("Category", "श्रेणी")}</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => { setSelectedCategory(""); setSelectedSubCategory(""); }}
              className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                !selectedCategory
                  ? "bg-primary-100 text-primary-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("All Categories", "सभी श्रेणियां")}
            </button>
          </li>
          {categories.map((cat: CategoryHierarchy) => {
            const hasSubs = cat.subCategories && cat.subCategories.length > 0;
            const isActive = selectedCategory === cat.name && !selectedSubCategory;
            const isExpanded = expandedCats[cat.name] ?? isActive;
            return (
              <li key={cat.name}>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSelectedSubCategory("");
                      if (hasSubs) {
                        setExpandedCats(prev => ({ ...prev, [cat.name]: true }));
                      }
                    }}
                    className={`text-sm flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary-100 text-primary-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                  {hasSubs && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(cat.name);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
                {hasSubs && isExpanded && (
                  <ul className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                    <li>
                      <button
                        onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory(""); }}
                        className={`text-xs w-full text-left px-2 py-1.5 rounded transition-colors ${
                          selectedCategory === cat.name && !selectedSubCategory
                            ? "bg-primary-50 text-primary-600 font-medium"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {t("All", "सभी")} {cat.name}
                      </button>
                    </li>
                    {cat.subCategories.map((sub: string) => (
                      <li key={sub}>
                        <button
                          onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory(sub); }}
                          className={`text-xs w-full text-left px-2 py-1.5 rounded transition-colors ${
                            selectedSubCategory === sub
                              ? "bg-primary-50 text-primary-600 font-medium"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {sub}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">{t("Price Range", "मूल्य सीमा")}</h3>
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
                onMouseUp={() => { handlePriceApply(priceRange[0], priceRange[1]); }}
                onTouchEnd={() => { handlePriceApply(priceRange[0], priceRange[1]); }}
                className="w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0"
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
                onMouseUp={() => { handlePriceApply(priceRange[0], priceRange[1]); }}
                onTouchEnd={() => { handlePriceApply(priceRange[0], priceRange[1]); }}
                className="w-full h-2 appearance-none bg-transparent cursor-pointer -mt-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0"
              />
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={minRef}
              type="number"
              placeholder={`Min ₹${Math.round(sliderMin)}`}
              defaultValue={sliderMin}
              className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              ref={maxRef}
              type="number"
              placeholder={`Max ₹${Math.round(sliderMax)}`}
              defaultValue={sliderMax}
              className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full text-sm bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            {t("Apply Price", "मूल्य लागू करें")}
          </button>
          <button onClick={resetPrice} className="w-full text-xs text-gray-500 hover:text-gray-700">
            {t("Reset Price", "मूल्य रीसेट करें")}
          </button>
        </div>
      </div>

      <button onClick={resetAll} className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors">
        {t("Reset All Filters", "सभी फ़िल्टर रीसेट करें")}
      </button>
    </div>
  );
}

export default function ProductsPage() {
  const { addItem, openCart } = useCart();
  const { t } = useLanguage();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [dbCategories, setDbCategories] = useState<CategoryHierarchy[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [userMin, setUserMin] = useState(0);
  const [userMax, setUserMax] = useState(0);
  const [priceApplied, setPriceApplied] = useState(false);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  const LIMIT = 24;

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => setBrands([]));

    fetch(`/api/products?limit=9999`)
      .then((r) => r.json())
      .then((data) => {
        const prods = data.products || [];
        setAllProducts(prods);
        if (data.priceRange) {
          setSliderMin(data.priceRange.min);
          setSliderMax(data.priceRange.max);
          setPriceRange([data.priceRange.min, data.priceRange.max]);
          setUserMin(data.priceRange.min);
          setUserMax(data.priceRange.max);
        }
        if (data.categories) setDbCategories(data.categories);
        setLoading(false);
      })
      .catch(() => {
        setAllProducts([]);
        setLoading(false);
      });
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(allProducts, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "color", weight: 0.2 },
        { name: "category", weight: 0.2 },
        { name: "brand.name", weight: 0.2 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let results = allProducts;

    if (search.trim()) {
      results = fuse.search(search.trim()).map((r) => r.item);
    }

    if (selectedBrand) {
      results = results.filter((p) => (p.brand?.slug || p.brand?.name) === selectedBrand);
    }

    if (selectedCategory) {
      results = results.filter((p) => p.category === selectedCategory);
    }

    if (selectedSubCategory) {
      results = results.filter((p) => p.subCategory === selectedSubCategory);
    }

    const min = priceApplied ? userMin : sliderMin;
    const max = priceApplied ? userMax : sliderMax;
    if (min > 0 || max > 0) {
      results = results.filter((p) => {
        if (min > 0 && p.price < min) return false;
        if (max > 0 && p.price > max) return false;
        return true;
      });
    }

    switch (sort) {
      case "price-asc": results = [...results].sort((a, b) => a.price - b.price); break;
      case "price-desc": results = [...results].sort((a, b) => b.price - a.price); break;
      case "name-asc": results = [...results].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": results = [...results].sort((a, b) => b.name.localeCompare(a.name)); break;
      case "oldest": results = [...results].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "newest":
      default: results = [...results].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }

    return results;
  }, [allProducts, search, selectedBrand, selectedCategory, sort, userMin, userMax, priceApplied, sliderMin, sliderMax, fuse]);

  const totalPages = Math.ceil(filteredProducts.length / LIMIT);
  const paginatedProducts = filteredProducts.slice((page - 1) * LIMIT, page * LIMIT);

  useEffect(() => {
    setPage(1);
  }, [search, selectedBrand, selectedCategory, selectedSubCategory, sort]);

  const applyPrice = (min: number, max: number) => {
    setUserMin(min);
    setUserMax(max);
    setPriceApplied(true);
    setPage(1);
  };

  const handlePriceApply = (min?: number, max?: number) => {
    const minVal = min !== undefined ? min : (minRef.current ? parseFloat(minRef.current.value) || 0 : 0);
    const maxVal = max !== undefined ? max : (maxRef.current ? parseFloat(maxRef.current.value) || 0 : 0);
    applyPrice(minVal, maxVal);
  };

  const resetPrice = () => {
    setUserMin(sliderMin);
    setUserMax(sliderMax);
    setPriceRange([sliderMin, sliderMax]);
    setPriceApplied(false);
    if (minRef.current) minRef.current.value = String(sliderMin);
    if (maxRef.current) maxRef.current.value = String(sliderMax);
    setPage(1);
  };

  const resetAll = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSort("newest");
    setUserMin(sliderMin);
    setUserMax(sliderMax);
    setPriceRange([sliderMin, sliderMax]);
    setPriceApplied(false);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayCategories = dbCategories.length > 0
    ? dbCategories
    : [
        { name: "Chairs", subCategories: ["Armless Chairs", "Baby Chairs", "Economical Chairs", "HoReCa Chairs", "Medium Back Chairs", "Premium Chairs"] },
        { name: "Stools", subCategories: [] },
        { name: "Tables", subCategories: [] },
        { name: "Houseware", subCategories: ["Storage Containers", "Bath & Kitchen", "Racks & Organizers"] },
        { name: "Dustbins", subCategories: [] },
        { name: "Household", subCategories: [] },
        { name: "Cabinets", subCategories: [] },
        { name: "Cleaning", subCategories: [] },
        { name: "Crates & Baskets", subCategories: [] },
        { name: "Insulated", subCategories: [] },
      ] as CategoryHierarchy[];

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (selectedBrand) {
    const b = brands.find((br: any) => (br.slug || br.name) === selectedBrand);
    activeFilters.push({ label: b?.name || selectedBrand, onRemove: () => { setSelectedBrand(""); setSelectedCategory(""); setSelectedSubCategory(""); } });
  }
  if (selectedSubCategory) {
    activeFilters.push({ label: selectedSubCategory, onRemove: () => setSelectedSubCategory("") });
  } else if (selectedCategory) {
    activeFilters.push({ label: selectedCategory, onRemove: () => { setSelectedCategory(""); setSelectedSubCategory(""); } });
  }
  if (priceApplied && (userMin > sliderMin || userMax < sliderMax)) {
    activeFilters.push({
      label: `₹${Math.round(userMin)} - ₹${Math.round(userMax)}`,
      onRemove: resetPrice,
    });
  }

  const filterSidebarProps = {
    brands, selectedBrand, setSelectedBrand, categories: displayCategories, selectedCategory,
    setSelectedCategory, selectedSubCategory, setSelectedSubCategory, sliderMin, sliderMax, priceRange, setPriceRange,
    minRef, maxRef, handlePriceApply, resetPrice, resetAll, t,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("All Products", "सभी उत्पादन")}</h1>
          <p className="text-xs md:text-sm text-gray-500">{filteredProducts.length} products</p>
        </div>

        <div className="flex gap-2 mb-4 md:mb-6">
          <input
            type="text"
            placeholder={t("Search products...", "उत्पादन खोजें...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">{t("Newest", "नवीनतम")}</option>
            <option value="oldest">{t("Oldest", "पुराने")}</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t("Filter", "फ़िल्टर")}
            {activeFilters.length > 0 && (
              <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                {f.label}
                <button onClick={f.onRemove} className="ml-0.5 hover:text-primary-900">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <button onClick={resetAll} className="text-xs text-gray-500 hover:text-red-500 ml-1">{t("Clear all", "सभी हटाएं")}</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <FilterSidebar {...filterSidebarProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-16 md:py-20 text-gray-500">
                <p className="text-lg">{t("No products found.", "कोई उत्पादन नहीं मिला।")}</p>
                <p className="text-sm mt-1">{t("Try adjusting your search or filters.", "अपनी खोज या फ़िल्टर बदलकर देखें।")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {paginatedProducts.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <Link href={`/product/${product.id}`}>
                        <div className="relative aspect-square bg-gray-100">
                          {product.imageUrl ? (
                            <BlurImage src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">{t("No Image", "कोई फ़ोटो नहीं")}</div>
                          )}
                        </div>
                      </Link>
                      <div className="p-3 md:p-4">
                        <ProductTags tags={product.tags || ""} />
                        <div className="flex items-start justify-between gap-1 md:gap-2">
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1 text-sm md:text-base">{product.name}</h3>
                          </Link>
                          <WishlistButton product={{ id: product.id, name: product.name, imageUrl: product.imageUrl || "", price: product.price, color: product.color || "", size: product.size || "", brand: product.brand?.name }} />
                        </div>
                        <div className="flex gap-1 md:gap-2 mt-1 text-xs md:text-sm text-gray-500">
                          {product.color && <span className="truncate">{product.color}</span>}
                          {product.size && <span>• {product.size}</span>}
                        </div>
                        <p className="text-base md:text-lg font-bold text-primary-500 mt-1.5 md:mt-2">₹{product.price}</p>
                        {product.brand?.name && <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{product.brand.name}</p>}
                        <button
                          onClick={() => {
                            addItem({ id: product.id, name: product.name, color: product.color || "", size: product.size || "", price: product.price, imageUrl: product.imageUrl || "", brand: product.brand?.name });
                            openCart();
                          }}
                          className="mt-2 md:mt-3 block w-full text-center bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          {t("Add to Cart", "कार्ट में जोड़ें")}
                        </button>
                        <div className="hidden sm:block">
                          <CompareButton product={{ id: product.id, name: product.name, color: product.color || "", size: product.size || "", price: product.price, imageUrl: product.imageUrl || "", brand: product.brand?.name, stock: product.stock ?? 0, category: product.category || "" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-8 md:mt-10 overflow-x-auto pb-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {t("Prev", "पिछला")}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && typeof arr[i - 1] === "number" && p - (arr[i - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        typeof p === "string" ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-gray-400">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                              page === p ? "bg-primary-500 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {t("Next", "अगला")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{t("Filter", "फ़िल्टर")}</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 -mr-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar {...filterSidebarProps} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                {t("Show", "दिखाएं")} {filteredProducts.length} {t("results", "परिणाम")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
