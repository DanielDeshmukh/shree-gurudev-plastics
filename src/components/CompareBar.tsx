"use client";

import { useCompare } from "@/context/CompareContext";
import { useRouter, usePathname } from "next/navigation";
import BlurImage from "@/components/BlurImage";

export default function CompareBar() {
  const { items, removeCompare, clearCompare, compareCount } = useCompare();
  const router = useRouter();
  const pathname = usePathname();

  if (compareCount === 0 || pathname === "/compare") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary-500 shadow-2xl transform transition-transform duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="relative shrink-0 group">
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-primary-200">
                {item.imageUrl ? (
                  <BlurImage src={item.imageUrl} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                )}
              </div>
              <button
                onClick={() => removeCompare(item.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow"
              >
                \u00D7
              </button>
              <p className="text-[10px] text-gray-500 mt-1 text-center max-w-14 truncate">{item.name}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => router.push("/compare")}
            className="px-5 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow"
          >
            Compare ({compareCount}/4)
          </button>
        </div>
      </div>
    </div>
  );
}
