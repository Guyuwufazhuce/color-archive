import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Color Archive",
  description:
    "Get in touch with Color Archive. Reach us at color-archive@333401.xyz.",
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Contact</h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Have a question, suggestion, or feedback? We would love to hear from
        you. Send us an email and we will get back to you as soon as possible.
      </p>

      <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-sm text-gray-600 mb-2">Email:</p>
        <a
          href="mailto:color-archive@333401.xyz"
          className="text-base font-medium text-blue-600 hover:text-blue-800 underline"
        >
          color-archive@333401.xyz
        </a>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed mt-8">
        We typically respond within 1–2 business days. Please allow additional
        time for replies during weekends and holidays.
      </p>
    </main>
  );
}
