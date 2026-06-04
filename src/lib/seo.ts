import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import { ColorPageData } from "@/data/colorData";
import { GuideData } from "@/data/guideData";

export function buildMetadata(overrides: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  const url = `${siteConfig.url}${overrides.path}`;
  return {
    title: overrides.title,
    description: overrides.description,
    keywords: overrides.keywords?.join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: overrides.title,
      description: overrides.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: overrides.ogImage
        ? [{ url: overrides.ogImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: overrides.title,
      description: overrides.description,
    },
  };
}

export function buildColorMetadata(color: ColorPageData): Metadata {
  return buildMetadata({
    title: color.seo.title,
    description: color.seo.description,
    path: `/colors/${color.slug}`,
    keywords: color.seo.keywords,
  });
}

export function buildGuideMetadata(guide: GuideData): Metadata {
  return buildMetadata({
    title: guide.seo.title,
    description: guide.seo.description,
    path: `/guide/${guide.slug}`,
    keywords: guide.seo.keywords,
  });
}

export function buildPageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return buildMetadata({ title, description, path });
}