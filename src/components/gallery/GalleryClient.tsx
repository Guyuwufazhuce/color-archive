"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { ImageData } from "@/lib/types";
import { loadImages, saveImages } from "@/lib/types";

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

const PAGE_SIZE = 12;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function pageTitle(filter: ColorFilter): string {
  return filter ?? "Select a color to browse images.";
}

export default function GalleryClient() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeFilter, setActiveFilter] = useState<ColorFilter>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeMsg, setReanalyzeMsg] = useState<string | null>(null);

  useEffect(() => {
    setImages(loadImages());
  }, []);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter]);

  // Only show images when a color filter is active
  // Uses color_tags array so images can appear under multiple categories
  const filteredImages = useMemo(() => {
    if (activeFilter === null) return [];
    return images.filter((img) => {
      const tags = (img.color_tags ?? [img.color_name]).map((t) => String(t));
      return tags.includes(activeFilter);
    });
  }, [images, activeFilter]);

  const displayImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const hasMore = visibleCount < filteredImages.length;

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.confirm("Delete this image?")) return;

      setDeleteError(null);

      try {
        const updated = images.filter((img) => img.id !== id);
        saveImages(updated);
        setImages(updated);
      } catch (err) {
        setDeleteError(
          err instanceof Error ? err.message : "Failed to delete image"
        );
      }
    },
    [images]
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const handleReanalyze = useCallback(async () => {
    setReanalyzing(true);
    setReanalyzeMsg("Reanalyzing images…");
    try {
      const { reanalyzeAllImages } = await import("@/lib/colorAnalysis");
      const count = await reanalyzeAllImages();
      setReanalyzeMsg(`Done! ${count} images reanalyzed.`);
      setImages(loadImages());
    } catch (err) {
      setReanalyzeMsg(
        err instanceof Error ? err.message : "Reanalysis failed"
      );
    } finally {
      setReanalyzing(false);
      setTimeout(() => setReanalyzeMsg(null), 4000);
    }
  }, []);

  const isEmptyGallery = images.length === 0;
  const noColorSelected = activeFilter === null;
  const noMatch = activeFilter !== null && filteredImages.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          {pageTitle(activeFilter)}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="text-[10px] text-gray-400 hover:text-gray-600 disabled:text-gray-300 transition-colors"
          >
            {reanalyzing ? "Analyzing…" : "Reanalyze"}
          </button>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Upload more
          </Link>
        </div>
      </div>

      {/* Reanalyze status toast */}
      {reanalyzeMsg && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600">
          {reanalyzeMsg}
        </div>
      )}

      {/* Delete error toast */}
      {deleteError && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {deleteError}
        </div>
      )}

      {/* Color Filter Bar — always visible once there are images */}
      {images.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-x-4 gap-y-6 items-start">
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.name;
              const count = images.filter((img) => {
                const tags = (img.color_tags ?? [img.color_name]).map((t) => String(t));
                return tags.includes(cat.name);
              }).length;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveFilter(isActive ? null : cat.name);
                  }}
                  className="relative flex flex-col items-center gap-0.5"
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
                  <span className="text-[9px] text-gray-400 leading-none">{count}</span>
                  <span className="text-[9px] text-gray-300 leading-none">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty states */}
      {isEmptyGallery && (
        <div className="text-center py-24">
          <p className="text-gray-300 text-sm mb-4">Empty Gallery</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Upload your first image
          </Link>
        </div>
      )}

      {!isEmptyGallery && noColorSelected && (
        <div className="text-center py-24">
          <p className="text-gray-300 text-sm">Select a color to browse images.</p>
        </div>
      )}

      {noMatch && (
        <div className="text-center py-24">
          <p className="text-gray-300 text-sm mb-4">
            No images match this color
          </p>
          <button
            onClick={() => setActiveFilter(null)}
            className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Browse all colors
          </button>
        </div>
      )}

      {/* Image grid — only when a color is selected and results exist */}
      {!noColorSelected && displayImages.length > 0 && (
        <>
          <div className="masonry-grid" style={{ columnCount: 2, columnGap: 32 }}>
            {displayImages.map((img) => (
              <Link
                key={img.id}
                href={`/photo/${img.id}`}
                className="block group mb-8 sm:mb-8"
                style={{ breakInside: "avoid" }}
              >
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-full" style={{ aspectRatio: "auto" }}>
                    <img
                      src={img.image_url}
                      alt={img.name}
                      className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                      Image not found
                    </div>
                  </div>

                  {/* Delete button — top-right, visible on hover */}
                  <button
                    onClick={(e) => handleDelete(e, img.id)}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Delete"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>

                  {/* Hover overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-white/40"
                        style={{ backgroundColor: img.color_hex }}
                      />
                      <span className="text-xs text-white font-medium">
                        {img.color_hex}
                      </span>
                      <span className="text-[10px] text-white/70 ml-auto">
                        {img.color_name}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {(img.dominant_colors ?? []).slice(0, 4).map((c, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full border border-white/30"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                    {(img.color_tags ?? [img.color_name]).length > 0 && (
                      <div className="text-[10px] text-white/50 mt-0.5 flex gap-1 flex-wrap">
                        {(img.color_tags ?? [img.color_name]).slice(0, 3).map((t, i) => (
                          <span key={i} className="bg-white/20 px-1.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[10px] text-white/50 mt-0.5">
                      {formatDate(img.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
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