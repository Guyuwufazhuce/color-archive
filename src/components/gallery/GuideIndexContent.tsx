"use client";

import Link from "next/link";
import { guidePages } from "@/data/guideData";
import { useLanguage } from "@/lib/LanguageContext";

export default function GuideIndexContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {t("guideIndex.title")}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        {t("guideIndex.subtitle")}
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {guidePages.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guide/${guide.slug}`}
            className="group block p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                {guide.category}
              </span>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-400">{guide.readTime}</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
              {guide.title}
            </h2>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
              {guide.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}