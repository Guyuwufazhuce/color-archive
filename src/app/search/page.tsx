import { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "@/components/gallery/SearchClient";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Search Photos by HEX — Color Archive",
  description:
    "Search community photos by HEX color code. Find images with matching or similar colors.",
  alternates: { canonical: `${siteConfig.url}/search` },
  openGraph: {
    title: "Search Photos by HEX — Color Archive",
    description: "Search community photos by HEX color code.",
  },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center py-16 text-sm text-gray-400">
            Loading...
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}