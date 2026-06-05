import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Color Archive",
  description:
    "Color Archive processes all images locally in your browser. No image data is uploaded to our servers. Learn how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Privacy Policy
      </h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        <strong>Last updated:</strong> June 5, 2026
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Image Processing
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Color Archive processes all images entirely in your browser using
        client-side JavaScript. No image data, pixel information, or uploaded
        files are transmitted to our servers or any third party. Your images
        remain on your device at all times.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Local Storage
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The application uses your browser&apos;s localStorage to store image
        metadata (file name, color analysis results, and a compressed data URL
        of the image). This data never leaves your browser and can be cleared
        at any time through your browser settings.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Cookies
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Color Archive does not set any cookies of its own. However, we use
        Google Analytics (GA4) to collect anonymized usage statistics such as
        page views and session duration. Google Analytics sets its own cookies
        and may collect your IP address. You can opt out by installing the
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}Google Analytics Opt-out Browser Add-on
        </a>.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Google AdSense
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        This site may display ads served by Google AdSense. AdSense uses
        cookies and web beacons to serve relevant ads based on your browsing
        history. Google&apos;s use of advertising cookies enables it and its
        partners to serve ads based on your visit to this site and other sites
        on the internet. You may opt out of personalized advertising by visiting
        <a
          href="https://adssettings.google.com"
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}Google Ad Settings
        </a>.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Third-Party Services
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        We use the following third-party services:
      </p>
      <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-disc pl-5 space-y-1">
        <li>
          <strong>Google Analytics</strong> — anonymized usage tracking
        </li>
        <li>
          <strong>Google AdSense</strong> — contextual and personalized
          advertising
        </li>
      </ul>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Data Retention
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        We do not store any personal data on our servers. All image data is
        stored locally in your browser and can be deleted by clearing your
        browser&apos;s localStorage or site data for this domain.
      </p>

      <h2 className="text-base font-medium text-gray-900 mt-8 mb-3">
        Contact
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        If you have any questions about this privacy policy, please contact us
        at{" "}
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
