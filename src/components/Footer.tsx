"use client";

import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { useLanguage } from "@/lib/LanguageContext";

export default function FooterContent() {
  const { t } = useLanguage();

  const colors = ["red", "blue", "green", "yellow", "purple", "pink"];

  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-900 tracking-tight"
            >
              {siteConfig.name}
            </Link>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {t("footer.pages")}
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {t("nav.home")}
              </Link>
              <Link href="/colors" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {t("nav.colors")}
              </Link>
              <Link href="/guide" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {t("nav.guides")}
              </Link>
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {t("footer.colors")}
            </h3>
            <div className="flex flex-col gap-2">
              {colors.map((c) => (
                <Link
                  key={c}
                  href={`/colors/${c}`}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors capitalize"
                >
                  {t(`colorFamilies.${c}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {t("footer.company")}
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {t("nav.about")}
              </Link>
              <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {t("nav.contact")}
              </Link>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {t("footer.privacyPolicy")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-xs text-gray-400">{siteConfig.copyright}</p>
        </div>
      </div>
    </footer>
  );
}