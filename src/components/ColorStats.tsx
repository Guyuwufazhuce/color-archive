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
    const timer = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(timer);
  }, []);

  if (!counts) return null;

  const total = Array.from(counts.values()).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const bars: BarEntry[] = CATEGORIES.map((cat) => ({
    name: cat.name,
    hex: cat.hex,
    count: counts.get(cat.name) ?? 0,
    pct: Math.round(((counts.get(cat.name) ?? 0) / total) * 100),
  }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = bars[0]?.count ?? 1;
  const MAX_HEIGHT = 160;

  return (
    <div className="mt-14 w-full max-w-[900px] mx-auto">
      {/* Title */}
      <h2 className="text-center text-sm font-semibold text-gray-900 tracking-tight mb-8">
        Vertical Color Distribution
      </h2>

      {/* Bar chart — scrollable on mobile */}
      <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
        <div className="flex items-end justify-center gap-3 min-w-max px-3 sm:gap-5 sm:px-0">
          {bars.map((bar) => {
            const height = (bar.count / maxCount) * MAX_HEIGHT;
            const showPct = bar.pct >= 4;

            return (
              <Link
                key={bar.name}
                href={`/gallery?color=${encodeURIComponent(bar.name.toLowerCase())}`}
                className="relative flex flex-col items-center gap-0 no-underline group"
              >
                {/* Percentage (above bar, shows on hover) */}
                <div className="h-5 flex items-center justify-center overflow-hidden">
                  <span
                    className={`text-xs font-semibold text-gray-700 transition-all duration-200 ${
                      showPct
                        ? "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                        : "hidden"
                    }`}
                  >
                    {bar.pct}%
                  </span>
                </div>

                {/* Bar */}
                <div
                  className="cursor-pointer transition-all duration-300 ease-out group-hover:-translate-y-1"
                  style={{
                    width: "clamp(26px, 4vw, 34px)",
                    height: animated ? `${height}px` : "0px",
                    maxHeight: `${MAX_HEIGHT}px`,
                    borderRadius: "999px",
                    backgroundColor: bar.hex,
                    transition: "height 1.2s ease-out, transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-900 text-white text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap z-10 shadow-sm">
                  <div className="font-medium">{bar.name}</div>
                  <div>{bar.count} {bar.count === 1 ? "photo" : "photos"}</div>
                </div>

                {/* Label */}
                <div className="text-center pt-1.5">
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