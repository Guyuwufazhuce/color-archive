"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { ImageData, ColorCategory } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from "@/lib/types";
import AdsPlaceholder from "@/components/AdsPlaceholder";

const STORAGE_KEY = "color-…ages";

const FILTER_DOTS: { category: ColorCategory; color: string }[] = [
  { category: "red", color: "#FF3B30" },
  { category: "orange", color: "#FF9500" },
  { category: "yellow", color: "#FFD60A" },
  { category: "green", color: "#34C759" },
  { category: "cyan", color: "#00C7BE" },
  { category: "blue", color: "#007AFF" },
  { category: "purple", color: "#5856D6" },
  { category: "pink", color: "#FF2D55" },
  { category: "brown", color: "#A2845E" },
  { category: "grayscale", color: "#8E8E93" },
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
  const [activeFilter, setActiveFilter] = useState<ColorCategory | null>(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [tooltip, setTooltip] = useState<ColorCategory | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(loadImages());
    const onFocus = () => setImages(loadImages());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const filtered = useMemo(() => {
    let result = images;
    if (activeFilter) {
      result = result.filter((img) => img.category === activeFilter);
    }
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
      {/* Top bar: search + filter dots */}
      <div className="flex items-center gap-4 mb-8">
        {/* Search toggle */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Search size={16} className="text-gray-400" />
          </button>
          {searchOpen && (
            <div className="absolute left-0 top-10 z-10 animate-[searchOpen_200ms_ease]">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by HEX..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 px-3 py-1.5 text-xs border border-gray-200 rounded-full bg-white text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes searchOpen {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Color dots */}
        <div className="flex items-center gap-4">
          {FILTER_DOTS.map((d) => {
            const active = activeFilter === d.category;
            return (
              <div key={d.category} className="relative">
                <button
                  onClick={() =>
                    setActiveFilter(active ? null : d.category)
                  }
                  onMouseEnter={() => setTooltip(d.category)}
                  onMouseLeave={() => setTooltip(null)}
                  className="w-8 h-8 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: d.color,
                    transform: active ? "scale(1.15)" : "scale(1)",
                    boxShadow: active
                      ? `0 0 0 2px white, 0 0 0 3px ${d.color}`
                      : "none",
                  }}
                />
                {tooltip === d.category && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400">
                    {CATEGORY_LABELS[d.category]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad — top of gallery */}
      <AdsPlaceholder format="banner" className="mb-8" />

      {/* Masonry grid — increased gap */}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-4 md:gap-8">
        {filtered.map((img) => {
          const hex = img.dominantColors[0]?.hex || "#ccc";
          const name = CATEGORY_LABELS[img.category];
          return (
            <Link
              key={img.id}
              href={`/photo/${img.id}`}
              className="block mb-4 md:mb-8 break-inside-avoid group"
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