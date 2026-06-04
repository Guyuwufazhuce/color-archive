"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/siteConfig";

export default function PrivacyContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {t("privacy.title")}
      </h1>
      <p className="mt-2 text-xs text-gray-400">{t("privacy.lastUpdated")}</p>

      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("privacy.overview")}
          </h2>
          <p>{t("privacy.overviewDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("privacy.dataCollection")}
          </h2>
          <p>{t("privacy.dataCollectionDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("privacy.cookies")}
          </h2>
          <p>{t("privacy.cookiesDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("privacy.thirdParty")}
          </h2>
          <p>{t("privacy.thirdPartyDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("privacy.changes")}
          </h2>
          <p>{t("privacy.changesDesc")}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("privacy.contact")}
          </h2>
          <p>
            {t("privacy.contactDesc")}{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-gray-900 underline"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}