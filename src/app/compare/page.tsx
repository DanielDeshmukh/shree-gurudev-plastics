"use client";

import { useCompare } from "@/context/CompareContext";
import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { PHONE } from "@/lib/seo";
import { useLanguage } from "@/context/LanguageContext";

export default function ComparePage() {
  const { items, removeCompare, clearCompare, compareCount } = useCompare();
  const { t } = useLanguage();

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
    { label: t("Enquiry", "पूछताछ"), key: "enquiry" },
  ];

  const getRowBg = (index: number) => (index % 2 === 0 ? "bg-gray-50" : "bg-white");

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

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm min-w-[600px]">
            <tbody>
              {attributes.map((attr, rowIndex) => (
                <tr key={attr.key} className={getRowBg(rowIndex)}>
                  <td className="py-4 px-5 font-semibold text-gray-700 border-r border-gray-200 w-36 text-sm">
                    {attr.label}
                  </td>
                  {items.map((item) => (
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
                          <Link href={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-primary-500 transition-colors text-sm text-center">
                            {item.name}
                          </Link>
                        </div>
                      )}
                      {attr.key === "brand" && <span className="text-sm text-gray-700">{item.brand || "—"}</span>}
                      {attr.key === "price" && <span className="text-sm font-bold text-primary-500">₹{item.price}</span>}
                      {attr.key === "color" && <span className="text-sm text-gray-700">{item.color || "—"}</span>}
                      {attr.key === "size" && <span className="text-sm text-gray-700">{item.size || "—"}</span>}
                      {attr.key === "category" && <span className="text-sm text-gray-700">{item.category || "—"}</span>}
                      {attr.key === "stock" && (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${item.stock > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                           {item.stock > 0 ? t("In Stock", "स्टॉक में") : t("Out of Stock", "स्टॉक में नहीं")}
                        </span>
                      )}
                      {attr.key === "enquiry" && (
                        <a
                          href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hi, I'm interested in ${item.name}. Please share details.`)}`}
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
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex gap-3 p-4">
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  {item.imageUrl ? (
                    <BlurImage src={item.imageUrl} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">{t("No Image", "कोई फ़ोटो नहीं")}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-primary-500 text-sm line-clamp-1">{item.name}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                  <p className="text-base font-bold text-primary-500 mt-1">₹{item.price}</p>
                </div>
                <button onClick={() => removeCompare(item.id)} className="text-xs text-red-500 hover:text-red-600 self-start">{t("Remove", "हटाएं")}</button>
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-200 border-t border-gray-200">
                <div className="bg-gray-50 px-3 py-2"><span className="text-[10px] text-gray-500 block">{t("Color", "रंग")}</span><span className="text-xs text-gray-900">{item.color || "—"}</span></div>
                <div className="bg-white px-3 py-2"><span className="text-[10px] text-gray-500 block">{t("Size", "आकार")}</span><span className="text-xs text-gray-900">{item.size || "—"}</span></div>
                <div className="bg-gray-50 px-3 py-2"><span className="text-[10px] text-gray-500 block">{t("Category", "श्रेणी")}</span><span className="text-xs text-gray-900">{item.category || "—"}</span></div>
                <div className="bg-white px-3 py-2">
                  <span className="text-[10px] text-gray-500 block">{t("Stock", "स्टॉक")}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${item.stock > 0 ? "text-green-700" : "text-red-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                    {item.stock > 0 ? t("In Stock", "स्टॉक में") : t("Out", "नहीं")}
                  </span>
                </div>
              </div>
              <div className="p-3 border-t border-gray-200">
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
          ))}
        </div>
      </div>
    </main>
  );
}
