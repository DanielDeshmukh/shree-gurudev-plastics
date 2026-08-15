"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:border-primary-400 hover:text-primary-500 transition-colors"
    >
      <span className={language === "en" ? "text-primary-500" : ""}>EN</span>
      <span className="text-gray-300">/</span>
      <span className={language === "hi" ? "text-primary-500" : ""}>HI</span>
    </button>
  );
}
