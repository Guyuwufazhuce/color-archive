import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Color Archive",
  description:
    "Contact Color Archive. For questions, feedback, or inquiries, reach us at color-archive@333401.xyz.",
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Contact</h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        For questions, feedback, business inquiries, or copyright concerns,
        please contact:
      </p>

      <a
        href="mailto:color-archive@333401.xyz"
        className="text-sm text-blue-600 underline hover:text-blue-800"
      >
        color-archive@333401.xyz
      </a>
    </main>
  );
}