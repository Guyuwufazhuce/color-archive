import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import { guidePages } from "@/data/guideData";
import GuideIndexContent from "@/components/gallery/GuideIndexContent";

export const metadata: Metadata = {
  title: "Guides — Color Archive",
  description:
    "Learn about color psychology, how to organize images by color, best color palettes for design, and color combination basics. Free guides for designers and creatives.",
  alternates: { canonical: `${siteConfig.url}/guide` },
};

export default function GuideIndexPage() {
  return <GuideIndexContent />;
}