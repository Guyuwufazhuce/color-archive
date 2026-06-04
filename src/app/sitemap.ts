import { MetadataRoute } from "next";
import { siteConfig } from "@/data/siteConfig";
import { colorPages } from "@/data/colorData";
import { guidePages } from "@/data/guideData";
import { CATEGORY_ORDER } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", priority: 1.0 },
    { path: "/gallery", priority: 0.9 },
    { path: "/colors", priority: 0.8 },
    { path: "/guide", priority: 0.8 },
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
  ];

  const colorPagesSitemap = colorPages.map((c) => ({
    path: `/colors/${c.slug}`,
    priority: 0.7,
  }));

  const collectionPagesSitemap = CATEGORY_ORDER.map((c) => ({
    path: `/collection/${c}`,
    priority: 0.7,
  }));

  const guidePagesSitemap = guidePages.map((g) => ({
    path: `/guide/${g.slug}`,
    priority: 0.6,
  }));

  const all = [
    ...staticPages,
    ...colorPagesSitemap,
    ...collectionPagesSitemap,
    ...guidePagesSitemap,
  ];

  return all.map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page.priority,
  }));
}