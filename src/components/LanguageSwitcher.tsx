"use client";

import { useLanguage } from "@/lib/LanguageContext";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggle = () => {
    setLocale(locale === "en" ? "zh" : "en");
  };

  return (
    <button
      onClick={toggle}
      className="text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors bg-white/50 shrink-0"
      title={locale === "en" ? "Switch to Chinese" : "切换到英语"}
    >
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}