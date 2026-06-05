import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Color Archive",
  description:
    "Color Archive is a visual archive tool that organizes images through color analysis. Explore color-based collections and discover visual relationships.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        About Color Archive
      </h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Color Archive is a visual archive tool that organizes images through
        color analysis.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Users can upload images, explore color-based collections, and discover
        visual relationships between colors and photography.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed">
        Our goal is to create a simple and accessible space for exploring color
        in visual culture.
      </p>
    </main>
  );
}