"use client";

import Link from "next/link";
import { colorPages, type ColorPageData } from "@/data/colorData";
import { useLanguage } from "@/lib/LanguageContext";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { siteConfig } from "@/data/siteConfig";

interface Props {
  color: ColorPageData;
  slug: string;
}

export default function ColorDetailContent({ color, slug }: Props) {
  const { t } = useLanguage();
  const others = colorPages.filter((c) => c.slug !== slug);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/colors" className="hover:text-gray-600 transition-colors">
          {t("colorsIndex.title")}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{color.label}</span>
      </nav>

      {/* Hero */}
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {t("colorDetail.title", { label: color.label })}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t("colorDetail.hueRange")}: {color.hue}
          </p>
        </div>
      </div>

      {/* Description */}
      <section className="mt-8">
        <p className="text-sm text-gray-600 leading-relaxed">
          {color.description}
        </p>
      </section>

      {/* Swatches */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          {t("colorDetail.palette")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {color.swatches.map((s, i) => (
            <div key={i} className="group relative">
              <div
                className="w-12 h-12 rounded-xl border border-gray-100 cursor-pointer"
                style={{ backgroundColor: s }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {s}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ad slot */}
      <AdsPlaceholder format="banner" className="my-10" />

      {/* Psychology */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          {t("colorDetail.psychology")}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {color.psychology}
        </p>
      </section>

      {/* Use cases */}
      <section className="mt-10">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {t("colorDetail.useCases")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {color.useCases.map((uc, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {uc.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {uc.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Other color links */}
      <section className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          {t("colorDetail.exploreOther")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {others.map((c) => (
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
      </section>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${color.label} Color Collection`,
            description: color.description,
            url: `${siteConfig.url}/colors/${slug}`,
          }),
        }}
      />
    </>
  );
}