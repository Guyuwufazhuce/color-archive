"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { ImageData } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/types";

// ─── 18 Color Categories ────────────────────────────────────
const CATEGORIES = [
  { name: "Red", hex: "#FF3B30" },
  { name: "Orange", hex: "#FF9500" },
  { name: "Amber", hex: "#FFB340" },
  { name: "Yellow", hex: "#FFD60A" },
  { name: "Lime", hex: "#A3E635" },
  { name: "Green", hex: "#34C759" },
  { name: "Mint", hex: "#5EEAD4" },
  { name: "Cyan", hex: "#00C7BE" },
  { name: "Sky", hex: "#38BDF8" },
  { name: "Blue", hex: "#007AFF" },
  { name: "Indigo", hex: "#5856D6" },
  { name: "Purple", hex: "#AF52DE" },
  { name: "Pink", hex: "#FF2D55" },
  { name: "Rose", hex: "#FB7185" },
  { name: "Brown", hex: "#8B572A" },
  { name: "Gray", hex: "#8E8E93" },
  { name: "Black", hex: "#1C1C1E" },
  { name: "White", hex: "#F2F2F7" },
] as const;

type ColorFilter = string | null;

const SHOW_COUNT = 12;

function loadImages(): ImageData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function GalleryClient() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeFilter, setActiveFilter] = useState<ColorFilter>(null);

  useEffect(() => {
    setImages(loadImages());
  }, []);

  // Show all if filtering, otherwise Latest 12
  const displayImages = useMemo(() => {
    if (activeFilter) {
      return images.filter((img) => img.category === activeFilter);
    }
    return images.slice(0, SHOW_COUNT);
  }, [images, activeFilter]);

  useEffect(() => {
    console.log(
      `[gallery] Filter: ${activeFilter ?? "Latest"} → ${displayImages.length} images`
    );
  }, [activeFilter, displayImages.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          {activeFilter ? activeFilter : "Latest"}
        </h1>
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Upload more
        </Link>
      </div>

      {/* Color Filter Bar */}
      {images.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-4 sm:gap-5 items-center">
            {/* Grid icon for All/Latest */}
            <button
              onClick={() => {
                console.log("[gallery] Filter: All");
                setActiveFilter(null);
              }}
              className={`p-1 rounded-md transition-colors ${
                activeFilter === null
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-300 hover:text-gray-500"
              }`}
              title="Latest"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="1" width="6" height="6" />
                <rect x="9" y="1" width="6" height="6" />
                <rect x="1" y="9" width="6" height="6" />
                <rect x="9" y="9" width="6" height="6" />
              </svg>
            </button>

            {/* Color dots */}
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    console.log(`[gallery] Filter: ${cat.name}`);
                    setActiveFilter(isActive ? null : cat.name);
                  }}
                  className="relative group"
                  title={`${cat.name} (${cat.hex})`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-all duration-200 ${
                      isActive
                        ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: cat.hex }}
                  />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {displayImages.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-300 text-sm mb-4">
            {images.length === 0 ? "Empty Gallery" : "No images match this color"}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            {images.length === 0 ? "Upload your first image" : "Show all"}
          </Link>
        </div>
      ) : (
        <div className="masonry-grid" style={{ columnCount: 2, columnGap: 32 }}>
          {displayImages.map((img) => (
            <Link
              key={img.id}
              href={`/photo/${img.id}`}
              className="block group mb-8 sm:mb-8"
              style={{ breakInside: "avoid" }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={img.src}
                  alt={img.name}
                  className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                />
                {/* Hover overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: img.dominantColor }}
                    />
                    <span className="text-xs text-white font-medium">
                      {img.dominantColor}
                    </span>
                    <span className="text-[10px] text-white/70 ml-auto">
                      {img.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/50 mt-1">
                    {formatDate(img.createdAt)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Responsive columns */}
      <style jsx>{`
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 3 !important;
            column-gap: 32px;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 4 !important;
            column-gap: 32px;
          }
        }
        @media (max-width: 767px) {
          .masonry-grid {
            column-gap: 24px;
          }
        }
      `}</style>
    </div>
  );
}