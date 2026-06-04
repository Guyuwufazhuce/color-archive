import { Metadata } from "next";
import HomeClient from "./HomeClient";
import CommunityStats from "@/components/gallery/CommunityStats";
import LatestUploads from "@/components/gallery/LatestUploads";
import HomePageContent from "@/components/gallery/HomePageContent";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { siteConfig } from "@/data/siteConfig";

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
      <HomePageContent />

      {/* Tool section */}
      <HomeClient />

      {/* Ad — above gallery section */}
      <AdsPlaceholder format="leaderboard" className="max-w-6xl mx-auto px-4 mb-12" />

      {/* Community Stats */}
      <CommunityStats />

      {/* Latest Uploads */}
      <LatestUploads />
    </div>
  );
}