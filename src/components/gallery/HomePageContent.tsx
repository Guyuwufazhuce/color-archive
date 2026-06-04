"use client";

import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { colorPages } from "@/data/colorData";

export default function HomePageContent() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            {t("home.heroDesc")}
          </p>
        </div>
      </section>

      {/* SEO content section */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("home.browseByColor")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {colorPages.map((c) => (
              <Link
                key={c.slug}
                href={`/colors/${c.slug}`}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {t("home.feature1Title")}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.feature1Desc")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {t("home.feature2Title")}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.feature2Desc")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {t("home.feature3Title")}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.feature3Desc")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}