import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "About — Color Archive",
  description:
    "Color Archive is a free online tool that helps designers, photographers, and creatives organize their image collections by dominant color. No upload required, all processing happens in your browser.",
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        About
      </h1>

      <div className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            What is Color Archive?
          </h2>
          <p>
            Color Archive is a free, browser-based tool that automatically
            analyzes images and organizes them by their dominant color family.
            Upload any image and our color analysis engine extracts the most
            prominent colors, classifies them into one of ten color categories
            (red, orange, yellow, green, cyan, blue, purple, pink, brown, or
            grayscale), and displays your collection in a clean, moodboard-style
            layout.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Why we built it
          </h2>
          <p>
            As designers and creators ourselves, we found that organizing images
            by color was one of the most intuitive ways to browse visual
            collections — but most tools either required uploading to a server
            or didn&apos;t exist at all. We built Color Archive to solve this
            problem: a tool that works entirely in your browser, respects your
            privacy, and gets out of your way so you can focus on being
            creative.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Privacy first
          </h2>
          <p>
            Color Archive processes all images locally using the browser&apos;s
            Canvas API. Your images are never uploaded to any server — they
            never leave your computer. We don&apos;t collect, store, or share
            your images or any personal information. For more details, see our{" "}
            <a href="/privacy" className="text-gray-900 underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            How it works
          </h2>
          <p>
            When you upload an image, we compress it to a small width for
            performance, sample its pixels using the Canvas API, cluster similar
            colors together, filter out background tones (near-white,
            near-black, and transparent pixels), and classify the dominant color
            by its hue value. The entire process takes milliseconds and happens
            entirely in your browser.
          </p>
        </section>
      </div>
    </div>
  );
}