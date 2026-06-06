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
  pctLabel: string;
}

// White needs an outline so it's visible on light bg
function needsOutline(name: string) {
  return name === "White";
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

  const bars: BarEntry[] = CATEGORIES.map((cat) => {
    const count = counts.get(cat.name) ?? 0;
    const rawPct = total > 0 ? (count / total) * 100 : 0;
    return {
      name: cat.name,
      hex: cat.hex,
      count,
      pct: rawPct,
      pctLabel: rawPct >= 1 ? `${Math.round(rawPct)}%` : `${rawPct.toFixed(1)}%`,
    };
  })
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = bars[0]?.count ?? 1;
  const MAX_HEIGHT = 220;
  const MIN_HEIGHT = 12;

  return (
    <div className="w-full py-20">
      <div className="max-w-[1200px] w-[90vw] mx-auto">
        <div
          className="overflow-x-auto pb-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          <div className="flex items-end justify-center min-w-max gap-[32px] mx-auto">
            {bars.map((bar) => {
              const ratio = bar.count / maxCount;
              const height = Math.max(MIN_HEIGHT, ratio * MAX_HEIGHT);

              return (
                <Link
                  key={bar.name}
                  href={`/gallery?color=${encodeURIComponent(bar.name.toLowerCase())}`}
                  className="relative flex flex-col items-center no-underline group cursor-pointer"
                >
                  {/* Percentage */}
                  <div className="h-[18px] flex items-center justify-center mb-[12px]">
                    <span className="text-sm font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {bar.pctLabel}
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    className="cursor-pointer transition-all duration-300 ease-out group-hover:-translate-y-1"
                    style={{
                      width: "34px",
                      height: animated ? `${height}px` : "0px",
                      borderRadius: "999px",
                      backgroundColor: bar.hex,
                      border: needsOutline(bar.name) ? "1px solid #e5e7eb" : "none",
                      transition: "height 900ms ease-out, transform 0.2s ease",
                    }}
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 shadow-sm">
                    <div className="font-medium">{bar.name}</div>
                    <div>{bar.count} {bar.count === 1 ? "photo" : "photos"}</div>
                  </div>

                  {/* Label */}
                  <div className="text-center pt-[16px]">
                    <div className="text-sm font-semibold text-gray-700 leading-tight">
                      {bar.name}
                    </div>
                    <div className="mt-[6px] text-[13px] font-medium text-gray-500 leading-tight tabular-nums">
                      {bar.count}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}