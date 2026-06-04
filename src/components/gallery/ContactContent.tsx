"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/siteConfig";

export default function ContactContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {t("contact.title")}
      </h1>

      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>{t("contact.intro")}</p>

        <p>
          {t("contact.emailUs")}{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-gray-900 underline"
          >
            {siteConfig.email}
          </a>
        </p>

        <p className="text-gray-400 text-xs">
          {t("contact.responseTime")}
        </p>
      </div>
    </div>
  );
}