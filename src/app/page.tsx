import { Metadata } from "next";
import HomeClient from "./HomeClient";
import CommunityStats from "@/components/gallery/CommunityStats";
import LatestUploads from "@/components/gallery/LatestUploads";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { siteConfig } from "@/data/siteConfig";
import { colorPages } from "@/data/colorData";

export const metadata: Metadata = {
  title: "Color Archive — Sort Your Images by Color Automatically",
  description:
    "Free online tool to sort and organize your images by color family. Upload images, automatically extract dominant colors, and browse by red, blue, green, and more. All processing happens in your browser.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: "Color Archive — Sort Your Images by Color Automatically",
    description:
      "Free online tool to sort and organize your images by color family. Upload images, automatically extract dominant colors, and browse by color.",
  },
};

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            Sort your images by color.
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Drop any image and Color Archive automatically extracts its dominant
            colors and sorts it into the right color family. Share it with the
            community gallery. All processing happens in your browser.
          </p>
        </div>
      </section>

      {/* Tool section */}
      <HomeClient />

      {/* Community Stats */}
      <CommunityStats />

      {/* Latest Uploads */}
      <LatestUploads />

      {/* Ad placeholder */}
      <AdsPlaceholder format="leaderboard" className="max-w-6xl mx-auto px-4 mb-12" />

      {/* SEO content section */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Browse images by color
          </h2>
          <div className="flex flex-wrap gap-2">
            {colorPages.map((c) => (
              <a
                key={c.slug}
                href={`/colors/${c.slug}`}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Browser-only processing
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your images never leave your device. All color analysis runs
              locally using the Canvas API. No uploads, no servers, no privacy
              concerns.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              10 color families
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Images are automatically classified into red, orange, yellow,
              green, cyan, blue, purple, pink, brown, or grayscale. Manual
              override available for edge cases.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Community gallery
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Published images appear in the public gallery, browsable by color
              family. Explore the community library or contribute your own.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}