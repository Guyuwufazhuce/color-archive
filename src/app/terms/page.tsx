import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Color Archive",
  description:
    "Terms of service for Color Archive. By using this site, you agree to the terms outlined below.",
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Terms of Service
      </h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        <strong>Last updated:</strong> June 5, 2026
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Acceptance of Terms
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        By accessing or using Color Archive, you agree to be bound by these
        Terms of Service. If you do not agree, please do not use the site.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Use of Service
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Color Archive is provided as a free online tool for personal and
        non-commercial use. You may use the site to upload images for color
        analysis and organize your personal color library. All image processing
        is performed locally in your browser.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Prohibited Content
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        You agree not to upload, store, or process any content that:
      </p>
      <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
        <li>Is illegal, obscene, or violates any applicable law</li>
        <li>Infringes on the intellectual property rights of others</li>
        <li>Contains malware, viruses, or harmful code</li>
        <li>Depicts violence, hate speech, or explicit material</li>
      </ul>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Intellectual Property
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        All images you upload remain your property. Color Archive does not
        claim any ownership over your content. The Color Archive name, logo,
        and website design are the property of the site operator.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Disclaimer
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Color Archive is provided &quot;as is&quot; without any warranty,
        express or implied. We do not guarantee that the service will be
        uninterrupted, error-free, or that color analysis results are
        accurate for any particular purpose.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Limitation of Liability
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In no event shall Color Archive or its operators be liable for any
        damages arising from the use or inability to use the service,
        including but not limited to loss of data or loss of image files.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Changes to Terms
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        We reserve the right to update these terms at any time. Changes will
        be posted on this page with an updated &quot;Last updated&quot; date.
        Continued use of the site after changes constitutes acceptance of the
        new terms.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Contact
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        For questions about these terms, contact us at{" "}
        <a
          href="mailto:color-archive@333401.xyz"
          className="text-blue-600 underline hover:text-blue-800"
        >
          color-archive@333401.xyz
        </a>.
      </p>
    </main>
  );
}
