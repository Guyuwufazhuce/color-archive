import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import AboutContent from "@/components/gallery/AboutContent";

export const metadata: Metadata = {
  title: "About — Color Archive",
  description:
    "Color Archive is a free online tool that helps designers, photographers, and creatives organize their image collections by dominant color. No upload required, all processing happens in your browser.",
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return <AboutContent />;
}