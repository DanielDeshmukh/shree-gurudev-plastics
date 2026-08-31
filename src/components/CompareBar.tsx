"use client";

import { useCompare } from "@/context/CompareContext";
import { useRouter, usePathname } from "next/navigation";
import BlurImage from "@/components/BlurImage";
import { MdClose } from "react-icons/md";

export default function CompareBar() {
  const { items, removeCompare, clearCompare, compareCount } = useCompare();
  const router = useRouter();
  const pathname = usePathname();

  if (compareCount === 0 || pathname === "/compare") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2.5 flex-1 overflow-x-auto scrollbar-hide">
          {items.map((item, i) => (
            <div key={item.id} className="relative shrink-0 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 transition-all group-hover:shadow-md group-hover:border-gray-300">
                {item.imageUrl ? (
                  <BlurImage src={item.imageUrl} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">N/A</div>
                )}
              </div>
              <button
                onClick={() => removeCompare(item.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <MdClose size={11} />
              </button>
              <p className="text-[10px] text-gray-500 mt-1.5 text-center max-w-14 truncate leading-tight">{item.name}</p>
            </div>
          ))}
          {compareCount < 4 && (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 transition-colors hover:border-primary-400">
              <span className="text-gray-400 text-lg leading-none">+</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            Clear
          </button>
          <button
            onClick={() => router.push("/compare")}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg active:scale-[0.97]"
          >
            Compare ({compareCount}/4)
          </button>
        </div>
      </div>
    </div>
  );
}
