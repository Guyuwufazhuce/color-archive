import { Metadata } from "next";
import GalleryClient from "@/components/gallery/GalleryClient";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Gallery — Color Archive",
  description:
    "Browse community photos organized by dominant color. Discover images in red, blue, green, and more color families.",
  alternates: { canonical: `${siteConfig.url}/gallery` },
  openGraph: {
    title: "Gallery — Color Archive",
    description:
      "Browse community photos organized by dominant color.",
    url: `${siteConfig.url}/gallery`,
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}