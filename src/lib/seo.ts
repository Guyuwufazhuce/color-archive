import type { ColorPageData } from "@/data/colorData";
import type { GuideData } from "@/data/guideData";
import type { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";

export function buildColorMetadata(color: ColorPageData): Metadata {
  return {
    title: color.seo.title,
    description: color.seo.description,
    keywords: color.seo.keywords,
    alternates: { canonical: `${siteConfig.url}/colors/${color.slug}` },
    openGraph: {
      title: color.seo.title,
      description: color.seo.description,
      url: `${siteConfig.url}/colors/${color.slug}`,
    },
  };
}

export function buildGuideMetadata(guide: GuideData): Metadata {
  return {
    title: guide.seo.title,
    description: guide.seo.description,
    keywords: guide.seo.keywords,
    alternates: {
      canonical: `${siteConfig.url}/guide/${guide.slug}`,
    },
    openGraph: {
      title: guide.seo.title,
      description: guide.seo.description,
      url: `${siteConfig.url}/guide/${guide.slug}`,
    },
  };
}

export function buildCollectionMetadata(
  label: string,
  slug: string
): Metadata {
  const title = `${label} Color Archive — Browse Community Photos`;
  const description = `Browse ${label.toLowerCase()} photos submitted by the community. Discover images organized by ${label.toLowerCase()} — the ${label.toLowerCase()} color collection.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/collection/${slug}`,
    },
    openGraph: { title, description, url: `${siteConfig.url}/collection/${slug}` },
  };
}

export function buildPhotoMetadata(
  id: string,
  hex: string,
  family: string
): Metadata {
  const title = `Photo #${id.slice(0, 8)} — ${hex} | Color Archive`;
  const description = `View this photo with dominant color ${hex} (${family}) uploaded to Color Archive.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/photo/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/photo/${id}`,
    },
  };
}