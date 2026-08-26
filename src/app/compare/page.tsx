"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { PHONE } from "@/lib/seo";
import { useLanguage } from "@/context/LanguageContext";
import { MdArrowUpward, MdArrowDownward, MdStar, MdStarHalf, MdLocalShipping, MdChat } from "react-icons/md";

type RatingMap = Record<number, { avg: number; count: number }>;
type PincodeResult = { available: boolean; area: string; estimatedDays: string; deliveryCharge: string } | null;

function StarRating({ avg, count }: { avg: number; count: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(avg)) stars.push(<MdStar key={i} size={14} className="text-amber-400" />);
    else if (i - 0.5 <= avg) stars.push(<MdStarHalf key={i} size={14} className="text-amber-400" />);
    else stars.push(<MdStar key={i} size={14} className="text-gray-200" />);
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      <span className="text-[10px] text-gray-400 ml-1">({count})</span>
    </span>
  );
}

function SwipeableCard({ children, onSwipe }: { children: React.ReactNode; onSwipe: () => void }) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; setSwiping(true); };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) setOffset(Math.max(diff, -120));
  };
  const onTouchEnd = () => {
    setSwiping(false);
    if (offset < -80) { onSwipe(); setOffset(0); }
    else setOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-red-500 text-white text-xs font-medium rounded-xl" style={{ opacity: Math.min(Math.abs(offset) / 80, 1) }}>
        {offset < -80 ? "Release to remove" : "Swipe to remove"}
      </div>
      <div
        className="relative bg-white border border-gray-200 rounded-xl transition-transform"
        style={{ transform: `translateX(${offset}px)`, transition: swiping ? "none" : "transform 0.2s ease" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { items, removeCompare, clearCompare, compareCount } = useCompare();
  const { addItem, openCart } = useCart();
  const { t } = useLanguage();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [ratings, setRatings] = useState<RatingMap>({});
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<PincodeResult>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id).join(",");
    fetch(`/api/reviews/batch?ids=${ids}`)
      .then((r) => r.json())
      .then((d) => setRatings(d.ratings || {}))
      .catch(() => {});
  }, [items]);

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`/api/pincode?pincode=${pincode}`);
      const data = await res.json();
      setPincodeResult(data.pincode || null);
    } catch {
      setPincodeResult(null);
    }
    setPincodeLoading(false);
  };

  const handleBulkEnquiry = () => {
    const productList = items
      .map((item, i) => `${i + 1}. ${item.name}${item.color ? ` (${item.color})` : ""}${item.brand ? ` - ${item.brand}` : ""}`)
      .join("\n");
    const msg = `Namaste!\n\nI am interested in the following products:\n\n${productList}\n\nKindly share the best prices, availability, and delivery details for all.\n\nThank you!`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (compareCount === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">{t("No Products to Compare", "तुलना के लिए कोई उत्पादन नहीं")}</h1>
          <p className="text-gray-500 mb-6">{t("Add products to your comparison list to see them side by side.", "तुलना सूची में उत्पादन जोड़ें ताकि उन्हें एक साथ देख सकें।")}</p>
          <Link href="/products" className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium">
            {t("Browse Products", "उत्पादन देखें")}
          </Link>
        </div>
      </main>
    );
  }

  const attributes = [
    { label: t("Name", "नाम"), key: "name" },
    { label: t("Brand", "ब्रांड"), key: "brand" },
    { label: t("Price", "मूल्य"), key: "price" },
    { label: t("Color", "रंग"), key: "color" },
    { label: t("Size", "आकार"), key: "size" },
    { label: t("Category", "श्रेणी"), key: "category" },
    { label: t("Stock", "स्टॉक"), key: "stock" },
    { label: t("Rating", "रेटिंग"), key: "rating" },
    { label: t("Enquiry", "पूछताछ"), key: "enquiry" },
    { label: t("Cart", "कार्ट"), key: "cart" },
  ];

  const getRowBg = (index: number) => (index % 2 === 0 ? "bg-gray-50" : "bg-white");

  const hasDifference = (key: string) => {
    if (items.length < 2) return false;
    const values = items.map((item) => {
      const val = (item as Record<string, unknown>)[key];
      return val === null || val === undefined || val === "" ? "—" : String(val);
    });
    return new Set(values).size > 1;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("Compare Products", "उत्पादन की तुलना करें")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("Comparing", "तुलना हो रही है")} {compareCount} {compareCount !== 1 ? t("products", "उत्पादन") : t("product", "उत्पादन")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {compareCount < 4 && (
              <Link href="/products" className="px-3 py-2 text-sm font-medium text-primary-500 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors">
                + {t("Add", "जोड़ें")}
              </Link>
            )}
            <button onClick={clearCompare} className="px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
              {t("Clear All", "सभी हटाएं")}
            </button>
            {compareCount >= 2 && (
              <button onClick={handleBulkEnquiry} className="px-3 py-2 text-sm font-medium text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1.5">
                <MdChat size={16} /> {t("Enquiry All", "सभी की पूछताछ")}
              </button>
            )}
          </div>
        </div>

        {compareCount < 2 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-primary-700 font-medium">{t("Add more products to compare them side by side.", "तुलना के लिए और उत्पादन जोड़ें।")}</p>
            <Link href="/products" className="inline-block mt-3 text-primary-500 hover:text-primary-600 font-medium underline">
              {t("Browse Products", "उत्पादन देखें")}
            </Link>
          </div>
        )}

        {compareCount >= 2 && (
          <>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              {t("Amber dot indicates values differ across products", "नारंगी बिंदु दर्शाता है कि मान अलग-अलग हैं")}
            </p>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdLocalShipping size={18} className="text-primary-500" />
                {t("Check delivery:", "डिलीवरी जांचें:")}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setPincodeResult(null); }}
                  onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                  placeholder="6-digit pincode"
                  className="w-36 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-primary-500"
                />
                <button
                  onClick={checkPincode}
                  disabled={pincode.length !== 6 || pincodeLoading}
                  className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {pincodeLoading ? "..." : t("Check", "जांचें")}
                </button>
              </div>
              {pincodeResult && (
                <span className={`text-sm font-medium ${pincodeResult.available ? "text-green-600" : "text-red-500"}`}>
                  {pincodeResult.available
                    ? `${pincodeResult.area} - ${pincodeResult.estimatedDays}`
                    : t("Not deliverable", "डिलीवरी उपलब्ध नहीं")}
                </span>
              )}
            </div>
          </>
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm min-w-[600px] relative">
            <tbody>
              {attributes.map((attr, rowIndex) => {
                const differs = hasDifference(attr.key);
                return (
                <tr key={attr.key} className={`${getRowBg(rowIndex)} ${differs ? "ring-1 ring-inset ring-amber-300 bg-amber-50/50" : ""} ${attr.key === "name" ? "sticky top-0 z-10 bg-white shadow-sm" : ""}`}>
                  <td className={`py-4 px-5 font-semibold text-gray-700 border-r border-gray-200 w-36 text-sm ${attr.key === "name" ? "bg-white" : ""}`}>
                    <button
                      onClick={() => handleSort(attr.key)}
                      className="flex items-center gap-1 hover:text-primary-500 transition-colors text-left"
                    >
                      {attr.label}
                      {sortKey === attr.key ? (
                        sortDir === "asc" ? <MdArrowUpward size={14} className="text-primary-500" /> : <MdArrowDownward size={14} className="text-primary-500" />
                      ) : (
                        <span className="text-gray-300"><MdArrowUpward size={14} /></span>
                      )}
                      {differs && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" title={t("Values differ", "मान अलग-अलग हैं")} />}
                    </button>
                  </td>
                  {sortedItems.map((item) => (
                    <td key={item.id} className="py-4 px-5 border-r border-gray-100 last:border-r-0">
                      {attr.key === "name" && (
                        <div className="flex flex-col items-center gap-2">
                          <button onClick={() => removeCompare(item.id)} className="text-xs text-red-500 hover:text-red-600 underline">{t("Remove", "हटाएं")}</button>
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                            {item.imageUrl ? (
                              <BlurImage src={item.imageUrl} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                            )}
                          </div>
                          <Link href={`/product/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-500 transition-colors text-sm text-center">
                            {item.name}
                          </Link>
                        </div>
                      )}
                      {attr.key === "brand" && <span className="text-sm text-gray-700">{item.brand || "—"}</span>}
                      {attr.key === "price" && (
                        <span className={`text-sm font-bold ${item.price > 0 ? "text-primary-500" : "text-gray-400"}`}>
                          {item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : t("Contact for price", "मूल्य के लिए संपर्क करें")}
                        </span>
                      )}
                      {attr.key === "color" && <span className="text-sm text-gray-700">{item.color || "—"}</span>}
                      {attr.key === "size" && <span className="text-sm text-gray-700">{item.size || "—"}</span>}
                      {attr.key === "category" && <span className="text-sm text-gray-700">{item.category || "—"}</span>}
                       {attr.key === "stock" && (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${item.stock > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                           {item.stock > 0 ? `${item.stock} ${t("in stock", "स्टॉक में")}` : t("Out of Stock", "स्टॉक में नहीं")}
                        </span>
                      )}
                      {attr.key === "rating" && (
                        ratings[item.id] ? (
                          <StarRating avg={ratings[item.id].avg} count={ratings[item.id].count} />
                        ) : (
                          <span className="text-xs text-gray-300">{t("No reviews", "कोई समीक्षा नहीं")}</span>
                        )
                      )}
                      {attr.key === "enquiry" && (
                        <a
                          href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Namaste!\n\nI am interested in ${item.name}. Kindly share the price, availability, and delivery details.\n\nThank you!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 transition-colors bg-green-50 px-3 py-1.5 rounded-full"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </a>
                      )}
                      {attr.key === "cart" && (
                        <button
                          onClick={() => {
                            addItem({ id: item.id, name: item.name, color: item.color, size: item.size, price: item.price, imageUrl: item.imageUrl, brand: item.brand, stock: item.stock });
                            openCart();
                          }}
                          disabled={item.stock <= 0}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-full"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                          {item.stock > 0 ? t("Add to Cart", "कार्ट में जोड़ें") : t("Out of Stock", "स्टॉक में नहीं")}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {sortedItems.map((item) => (
            <SwipeableCard key={item.id} onSwipe={() => removeCompare(item.id)}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex gap-3 p-4">
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  {item.imageUrl ? (
                    <BlurImage src={item.imageUrl} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">{t("No Image", "कोई फ़ोटो नहीं")}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-500 text-sm line-clamp-1">{item.name}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                  <p className={`text-base font-bold mt-1 ${item.price > 0 ? "text-primary-500" : "text-gray-400"}`}>{item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : t("Contact for price", "मूल्य के लिए संपर्क करें")}</p>
                </div>
                <button onClick={() => removeCompare(item.id)} className="text-xs text-red-500 hover:text-red-600 self-start">{t("Remove", "हटाएं")}</button>
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-200 border-t border-gray-200">
                <div className={`px-3 py-2 ${hasDifference("color") ? "bg-amber-50" : "bg-gray-50"}`}><span className="text-[10px] text-gray-500 block">{t("Color", "रंग")}{hasDifference("color") && " *"}</span><span className="text-xs text-gray-900">{item.color || "—"}</span></div>
                <div className={`px-3 py-2 ${hasDifference("size") ? "bg-amber-50" : "bg-white"}`}><span className="text-[10px] text-gray-500 block">{t("Size", "आकार")}{hasDifference("size") && " *"}</span><span className="text-xs text-gray-900">{item.size || "—"}</span></div>
                <div className={`px-3 py-2 ${hasDifference("category") ? "bg-amber-50" : "bg-gray-50"}`}><span className="text-[10px] text-gray-500 block">{t("Category", "श्रेणी")}{hasDifference("category") && " *"}</span><span className="text-xs text-gray-900">{item.category || "—"}</span></div>
                <div className={`px-3 py-2 ${hasDifference("stock") ? "bg-amber-50" : "bg-white"}`}>
                  <span className="text-[10px] text-gray-500 block">{t("Stock", "स्टॉक")}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${item.stock > 0 ? "text-green-700" : "text-red-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                    {item.stock > 0 ? `${item.stock} ${t("in stock", "स्टॉक में")}` : t("Out", "नहीं")}
                  </span>
                </div>
                <div className="bg-gray-50 px-3 py-2">
                  <span className="text-[10px] text-gray-500 block">{t("Rating", "रेटिंग")}</span>
                  {ratings[item.id] ? (
                    <StarRating avg={ratings[item.id].avg} count={ratings[item.id].count} />
                  ) : (
                    <span className="text-[10px] text-gray-300">{t("No reviews", "कोई समीक्षा नहीं")}</span>
                  )}
                </div>
              </div>
              <div className="p-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    addItem({ id: item.id, name: item.name, color: item.color, size: item.size, price: item.price, imageUrl: item.imageUrl, brand: item.brand, stock: item.stock });
                    openCart();
                  }}
                  disabled={item.stock <= 0}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  {item.stock > 0 ? t("Add to Cart", "कार्ट में जोड़ें") : t("Out of Stock", "स्टॉक में नहीं")}
                </button>
                <a
                  href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hi, I'm interested in ${item.name}. Please share details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                          {t("WhatsApp Enquiry", "WhatsApp पूछताछ")}
                </a>
              </div>
              </div>
            </SwipeableCard>
          ))}
        </div>
      </div>
    </main>
  );
}
