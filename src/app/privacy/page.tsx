import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Privacy Policy — Color Archive",
  description:
    "Color Archive's privacy policy. All image processing happens locally in your browser. We don't collect, store, or share your images or personal data.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-gray-400">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Overview
          </h2>
          <p>
            Color Archive is designed with your privacy as a core principle. All
            image processing happens entirely in your browser using the
            Canvas API. Your images are never uploaded to any server.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Data Collection
          </h2>
          <p>
            We do not collect, store, or transmit any personal information or
            images. The images you upload remain on your device and are
            processed locally. Any data stored in localStorage is solely for
            your convenience and never leaves your browser.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Cookies
          </h2>
          <p>
            Color Archive does not use cookies for tracking purposes. We may use
            essential cookies required for the basic functioning of the
            website.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Third-Party Services
          </h2>
          <p>
            We do not integrate any third-party analytics, advertising, or
            tracking services by default. If we enable Google Analytics in the
            future, we will update this policy and only collect anonymized,
            aggregated usage data to help us improve the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Any changes
            will be reflected on this page with an updated &quot;Last
            updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Contact
          </h2>
          <p>
            If you have any questions about this privacy policy, please contact
            us at{" "}
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