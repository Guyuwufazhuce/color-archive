"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPhotos, recordToImageData } from "@/lib/galleryService";
import { CATEGORIES } from "@/lib/colorCategories";
import type { ImageData } from "@/lib/types";

function countColorTags(images: ImageData[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const img of images) {
    const tags = img.color_tags ?? [img.color_name];
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

export default function ColorStats() {
  const [counts, setCounts] = useState<Map<string, number> | null>(null);

  useEffect(() => {
    fetchPhotos()
      .then((records) => {
        const images = records.map(recordToImageData);
        setCounts(countColorTags(images));
      });
  }, []);

  // Only show categories that have at least one image tagged
  const visible = counts
    ? CATEGORIES.filter((cat) => (counts.get(cat.name) ?? 0) > 0)
    : [];

  if (!counts) return null; // no data yet — silent

  return (
    <div className="mt-14 w-full max-w-xl mx-auto text-center">
      {/* Title */}
      <h2 className="text-base font-semibold text-gray-900 tracking-tight">
        Color Library Stats
      </h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-6">
        Explore the archive by dominant colors
      </p>

      {/* Color pills */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-2.5">
        {visible.length === 0 && (
          <span className="text-xs text-gray-300">No images yet</span>
        )}
        {visible.map((cat) => {
          const count = counts.get(cat.name) ?? 0;
          return (
            <Link
              key={cat.name}
              href={`/gallery?color=${encodeURIComponent(cat.name.toLowerCase())}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.hex }}
              />
              <span className="font-medium">{cat.name}</span>
              <span className="text-gray-400 tabular-nums">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}