"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { ImageData, ColorCategory } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from "@/lib/types";
import AdsPlaceholder from "@/components/AdsPlaceholder";

const STORAGE_KEY = "color-archive-images";

const FILTER_ORDER: (ColorCategory | "all")[] = [
  "all",
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
  "brown",
  "grayscale",
];

function loadImages(): ImageData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function GalleryClient() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeFilter, setActiveFilter] = useState<ColorCategory | "all">("all");
  const [search, setSearch] = useState("");

  // Reload on mount and window focus (for after upload redirect)
  useEffect(() => {
    setImages(loadImages());

    const onFocus = () => setImages(loadImages());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filtered = useMemo(() => {
    let result = images;

    // Color filter
    if (activeFilter !== "all") {
      result = result.filter((img) => img.category === activeFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((img) => {
        const hex = img.dominantColors[0]?.hex?.toLowerCase() || "";
        const name =
          CATEGORY_LABELS[img.category]?.toLowerCase() || "";
        return hex.includes(q) || name.includes(q);
      });
    }

    return result;
  }, [images, activeFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by HEX or color name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-200 rounded-full bg-white text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Color filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {FILTER_ORDER.map((f) => {
          const isAll = f === "all";
          const active = activeFilter === f;
          const label = isAll ? "All" : CATEGORY_LABELS[f];
          const color = isAll ? undefined : CATEGORY_COLORS[f];

          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                active
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Ad — top of gallery */}
      <AdsPlaceholder format="banner" className="mb-8" />

      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
        {filtered.map((img) => {
          const hex = img.dominantColors[0]?.hex || "#ccc";
          const name = CATEGORY_LABELS[img.category];
          return (
            <Link
              key={img.id}
              href={`/photo/${img.id}`}
              className="block mb-4 break-inside-avoid group"
            >
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[11px] text-white font-medium">
                      {name} &middot; {hex}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-sm text-gray-300">
          {images.length === 0
            ? "Upload images to get started."
            : "No images match this filter."}
        </div>
      )}
    </div>
  );
}