"use client";

import Link from "next/link";
import { colorPages, type ColorPageData } from "@/data/colorData";
import { useLanguage } from "@/lib/LanguageContext";

function ColorCard({ color }: { color: ColorPageData }) {
  return (
    <Link
      href={`/colors/${color.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors overflow-hidden"
    >
      {/* Color gradient header */}
      <div className="h-24 relative">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: color.hex, opacity: 0.15 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1.5">
            {color.swatches.slice(0, 5).map((s, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-white/50 shadow-sm"
                style={{ backgroundColor: s }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color.hex }}
          />
          {color.label}
        </h2>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
          {color.description.slice(0, 120)}...
        </p>
      </div>
    </Link>
  );
}

export default function ColorsIndexContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {t("colorsIndex.title")}
      </h1>
      <p className="mt-2 text-sm text-gray-500 max-w-xl">
        {t("colorsIndex.subtitle")}
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {colorPages.map((color) => (
          <ColorCard key={color.slug} color={color} />
        ))}
      </div>
    </div>
  );
}