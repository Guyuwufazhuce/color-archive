import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Contact — Color Archive",
  description:
    "Get in touch with the Color Archive team. Send us your feedback, questions, or suggestions.",
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        Contact
      </h1>

      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>
          Have feedback, questions, or suggestions? We&apos;d love to hear from
          you.
        </p>

        <p>
          Email us at{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-gray-900 underline"
          >
            {siteConfig.email}
          </a>
        </p>

        <p className="text-gray-400 text-xs">
          We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
}