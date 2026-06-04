import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { colorPages, ColorPageData } from "@/data/colorData";

export const metadata: Metadata = {
  title: "Colors — Color Archive",
  description:
    "Browse our complete collection of color families. Learn about each color's psychology, design use cases, and view curated color palettes for red, blue, green, and more.",
  alternates: { canonical: `${siteConfig.url}/colors` },
};

function ColorCard({ color }: { color: ColorPageData }) {
  return (
    <Link
      href={`/colors/${color.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors overflow-hidden"
    >
      {/* Color gradient header */}
      <div className="h-24 relative">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: color.hex, opacity: 0.15 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1.5">
            {color.swatches.slice(0, 5).map((s, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-white/50 shadow-sm"
                style={{ backgroundColor: s }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color.hex }}
          />
          {color.label}
        </h2>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
          {color.description.slice(0, 120)}...
        </p>
        <div className="mt-2 text-[10px] text-gray-400">
          Hue range: {color.hue}
        </div>
      </div>
    </Link>
  );
}

export default function ColorsIndexPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        Colors
      </h1>
      <p className="mt-2 text-sm text-gray-500 max-w-xl">
        Explore each color family in detail — learn about color psychology,
        common design use cases, and view curated color swatches. Every color
        has a story.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {colorPages.map((color) => (
          <ColorCard key={color.slug} color={color} />
        ))}
      </div>
    </div>
  );
}