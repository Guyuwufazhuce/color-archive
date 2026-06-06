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

interface BarEntry {
  name: string;
  hex: string;
  count: number;
  pct: number;
}

export default function ColorStats() {
  const [counts, setCounts] = useState<Map<string, number> | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    fetchPhotos()
      .then((records) => {
        const images = records.map(recordToImageData);
        setCounts(countColorTags(images));
      });
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  if (!counts) return null;

  const total = Array.from(counts.values()).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const raw: BarEntry[] = CATEGORIES.map((cat) => ({
    name: cat.name,
    hex: cat.hex,
    count: counts.get(cat.name) ?? 0,
    pct: Math.round(((counts.get(cat.name) ?? 0) / total) * 100),
  }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = raw[0]?.count ?? 1;
  const MAX_HEIGHT = 220;
  const MIN_HEIGHT = 20;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8">
      <div className="overflow-x-auto pb-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
        <div className="flex items-end justify-center gap-3 min-w-max sm:gap-5">
          {raw.map((bar) => {
            // Proportional height, clamped between MIN and MAX
            const ratio = bar.count / maxCount;
            const height = Math.max(MIN_HEIGHT, ratio * MAX_HEIGHT);

            return (
              <Link
                key={bar.name}
                href={`/gallery?color=${encodeURIComponent(bar.name.toLowerCase())}`}
                className="relative flex flex-col items-center gap-0 no-underline group"
              >
                {/* Percentage */}
                <div className="h-5 flex items-center justify-center mb-1">
                  <span className="text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {bar.pct}%
                  </span>
                </div>

                {/* Bar */}
                <div
                  className="cursor-pointer transition-all duration-300 ease-out group-hover:-translate-y-1"
                  style={{
                    width: "32px",
                    height: animated ? `${height}px` : "0px",
                    borderRadius: "999px",
                    backgroundColor: bar.hex,
                    transition: "height 1.2s ease-out, transform 0.2s ease",
                  }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-900 text-white text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap z-10">
                  <div className="font-medium">{bar.name}</div>
                  <div>{bar.count} {bar.count === 1 ? "photo" : "photos"}</div>
                </div>

                {/* Label */}
                <div className="text-center pt-2">
                  <div className="text-[12px] font-medium text-gray-500 leading-tight">
                    {bar.name}
                  </div>
                  <div className="text-[12px] font-medium text-gray-500 leading-tight tabular-nums">
                    {bar.count}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}