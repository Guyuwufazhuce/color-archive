import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import { colorPages } from "@/data/colorData";
import ColorsIndexContent from "@/components/gallery/ColorsIndexContent";

export const metadata: Metadata = {
  title: "Colors — Color Archive",
  description:
    "Browse our complete collection of color families. Learn about each color's psychology, design use cases, and view curated color palettes for red, blue, green, and more.",
  alternates: { canonical: `${siteConfig.url}/colors` },
};

export default function ColorsIndexPage() {
  return <ColorsIndexContent />;
}