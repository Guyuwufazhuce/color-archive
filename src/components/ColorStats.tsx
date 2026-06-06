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

  const bars: BarEntry[] = CATEGORIES.map((cat) => ({
    name: cat.name,
    hex: cat.hex,
    count: counts.get(cat.name) ?? 0,
    pct: Math.round(((counts.get(cat.name) ?? 0) / total) * 100),
  }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = bars[0]?.count ?? 1;
  const MAX_HEIGHT = 220;
  const MIN_HEIGHT = 10;

  return (
    <div className="w-full py-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <div
          className="overflow-x-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          <div className="flex items-end justify-center min-w-max gap-8 mx-auto">
            {bars.map((bar) => {
              const ratio = bar.count / maxCount;
              const height = Math.max(MIN_HEIGHT, ratio * MAX_HEIGHT);

              return (
                <Link
                  key={bar.name}
                  href={`/gallery?color=${encodeURIComponent(bar.name.toLowerCase())}`}
                  className="relative flex flex-col items-center no-underline group"
                >
                  {/* Percentage */}
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <span className="text-sm font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {bar.pct}%
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    className="cursor-pointer transition-all duration-300 ease-out group-hover:-translate-y-1"
                    style={{
                      width: "40px",
                      height: animated ? `${height}px` : "0px",
                      borderRadius: "16px",
                      backgroundColor: bar.hex,
                      transition: "height 1.2s ease-out, transform 0.2s ease",
                    }}
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10">
                    <div className="font-medium">{bar.name}</div>
                    <div>{bar.count} {bar.count === 1 ? "photo" : "photos"}</div>
                  </div>

                  {/* Label */}
                  <div className="text-center pt-3">
                    <div className="text-[13px] font-medium text-gray-500 leading-tight">
                      {bar.name}
                    </div>
                    <div className="text-[13px] font-medium text-gray-500 leading-tight tabular-nums">
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