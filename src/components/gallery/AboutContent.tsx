"use client";

import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";

export default function AboutContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {t("about.title")}
      </h1>

      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("about.whatIs")}
          </h2>
          <p>{t("about.whatIsDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("about.whyBuilt")}
          </h2>
          <p>{t("about.whyBuiltDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("about.privacy")}
          </h2>
          <p>
            {t("about.privacyDesc")}{" "}
            <a href="/privacy" className="text-gray-900 underline">
              {t("nav.privacy")}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("about.howWorks")}
          </h2>
          <p>{t("about.howWorksDesc")}</p>
        </section>
      </div>
    </div>
  );
}