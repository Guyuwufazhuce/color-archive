"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { siteConfig } from "@/data/siteConfig";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { t } = useLanguage();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#f8f9fa]/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-900 tracking-tight shrink-0"
        >
          {siteConfig.name}
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden sm:block">
          <input
            type="search"
            placeholder={t("header.searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </form>

        <nav className="flex items-center gap-5 shrink-0">
          {siteConfig.nav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const key = item.href.replace("/", "") || "home";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs transition-colors ${
                  isActive
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t(`nav.${key}`)}
              </Link>
            );
          })}
          <LanguageSwitcher />
        </nav>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="sm:hidden">
          <input
            type="search"
            placeholder={t("header.searchPlaceholderMobile")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-24 text-xs bg-white border border-gray-200 rounded-full px-2 py-1.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </form>
      </div>
    </header>
  );
}