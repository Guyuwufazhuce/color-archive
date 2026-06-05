import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Color Archive",
  description:
    "Color Archive is a free online tool that extracts, analyzes, and organizes color palettes from your images using AI-powered clustering.",
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">About</h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Color Archive is a free online tool that helps you discover and organize
        colors from your images. Upload a photo, and our client-side analysis
        engine extracts its dominant color palette using K-means clustering,
        then classifies each color into one of 18 categories — from Red and
        Blue to Pink, Mint, and Brown.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Every image is automatically tagged with its color composition, so you
        can browse your collection by color, compare palettes, and find the
        perfect reference for your next project. All processing happens in your
        browser — no images are ever uploaded to a server.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed">
        Whether you are a designer, photographer, or simply curious about the
        colors around you, Color Archive gives you a clean, visual way to
        explore your image library through the lens of color.
      </p>
    </main>
  );
}
