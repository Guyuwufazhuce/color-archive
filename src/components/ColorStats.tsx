"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

function needsOutline(name: string) {
  return name === "White";
}

export default function ColorStats() {
  const router = useRouter();
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
  const MIN_HEIGHT = 8;

  const goToColor = (name: string) => {
    router.push(`/gallery?color=${encodeURIComponent(name.toLowerCase())}`);
  };

  return (
    <div className="w-full py-20">
      <div className="max-w-[1200px] w-[90vw] mx-auto">
        <div
          className="overflow-x-auto pb-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          <div className="flex flex-col items-center min-w-max px-4 sm:px-0">
            {/* ── Row 1: percentages ── */}
            <div className="flex gap-[28px]">
              {bars.map((bar) => (
                <div
                  key={bar.name}
                  className="flex flex-col items-center"
                  style={{ width: "48px" }}
                >
                  <div className="h-5 flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-gray-700">
                      {bar.pctLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Row 2: bars ── */}
            <div className="relative flex gap-[28px]">
              {bars.map((bar) => {
                const ratio = bar.count / maxCount;
                const height = Math.max(MIN_HEIGHT, ratio * MAX_HEIGHT);

                return (
                  <div
                    key={bar.name}
                    className="relative flex flex-col items-center cursor-pointer group"
                    onClick={() => goToColor(bar.name)}
                    style={{ width: "48px" }}
                  >
                    {/* Bar */}
                    <div
                      className="transition-all duration-300 ease-out group-hover:-translate-y-1"
                      style={{
                        width: "100%",
                        height: animated ? `${height}px` : "0px",
                        borderRadius: "8px 8px 0 0",
                        backgroundColor: bar.hex,
                        border: needsOutline(bar.name) ? "1px solid #e5e7eb" : "none",
                        transition: "height 800ms ease-out, transform 0.2s ease",
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 shadow-sm">
                      <div className="font-medium">{bar.name}</div>
                      <div>{bar.count} {bar.count === 1 ? "photo" : "photos"}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Baseline — shared horizontal line ── */}
            <div className="h-px bg-gray-200 w-full" />

            {/* ── Row 3: labels (name + count) ── */}
            <div className="flex gap-[28px] mt-3">
              {bars.map((bar) => (
                <div
                  key={bar.name}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => goToColor(bar.name)}
                  style={{ width: "48px" }}
                >
                  <div className="text-sm font-semibold text-gray-700 leading-tight">
                    {bar.name}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-500 leading-tight tabular-nums">
                    {bar.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}