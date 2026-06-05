import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Color Archive",
  description:
    "Privacy Policy for Color Archive. Learn how we handle user-uploaded images, cookies, analytics, and third-party services.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Privacy Policy
      </h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        User-uploaded images are used solely for color analysis and display on
        this website.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        We do not sell user data to any third party.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        This website may use cookies to enhance user experience.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        This website may use third-party analytics tools to understand site
        traffic and usage patterns.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        This website may display advertisements served by Google AdSense.
        AdSense uses cookies to serve relevant ads based on your browsing
        history.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Users are solely responsible for the content they upload. The website
        reserves the right to remove any content that violates our policies.
      </p>

      <div className="mt-10 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-600 leading-relaxed">
          For privacy-related inquiries, please contact:
        </p>
        <a
          href="mailto:color-archive@333401.xyz"
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          color-archive@333401.xyz
        </a>
      </div>
    </main>
  );
}