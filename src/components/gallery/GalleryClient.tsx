"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ImageData } from "@/lib/types";
import { fetchPhotos, deletePhoto, recordToImageData, updatePhotoVisualColor, resetPhotoManualOverride } from "@/lib/galleryService";
import { analyzeImage } from "@/lib/colorAnalysis";
import { updatePhotoAnalysis } from "@/lib/galleryService";
import PhotoCard from "./PhotoCard";

import { CATEGORIES } from "@/lib/colorCategories";

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
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ColorFilter>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // ── Fetch photos immediately; auto-analyze in background ──
  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const analyzing = new Set<string>();

    (async () => {
      const records = await fetchPhotos();
      if (cancelled) return;

      // DEBUG: dump all rows
      console.log("[auto-analyze] photos rows", records.map((r) => ({
        id: r.id.slice(0, 8),
        visual_color: r.visual_color,
        color_tags: r.color_tags,
        hasVisualColor: !!(typeof r.visual_color === "string" && r.visual_color.trim().length > 0),
        hasColorTags: !!(Array.isArray(r.color_tags) && r.color_tags.length > 0 && r.color_tags[0]),
        firstTag: r.color_tags?.[0],
      })));

      // Show images immediately — non-blocking
      setImages(records.map(recordToImageData));
      setLoading(false);

      // Simple rule: only auto-analyze if BOTH visual_color AND color_tags are missing,
      // AND manual_color_override is not true.
      const needAnalysis = records.filter((r) => {
        if (r.manual_color_override) return false;
        const hasTags = Array.isArray(r.color_tags) && r.color_tags.length > 0 && r.color_tags[0];
        const hasVisual = typeof r.visual_color === "string" && r.visual_color.trim().length > 0;
        const needs = !hasTags && !hasVisual;

        if (needs) {
          console.log("[auto-analyze] WILL_ANALYZE", r.id.slice(0, 8), {
            reason: !hasVisual && !hasTags ? "both missing" : !hasTags ? "tags missing" : "visual missing",
            visual_color: r.visual_color,
            color_tags: r.color_tags,
          });
        }
        return needs;
      });

      console.log("[auto-analyze] needAnalysis count:", needAnalysis.length, "ids:", needAnalysis.map((r) => r.id.slice(0, 8)));

      if (needAnalysis.length === 0) return;

      let updated = 0;

      for (const record of needAnalysis) {
        if (cancelled) break;
        if (!record.image_url) continue;
        if (analyzing.has(record.id)) continue;
        analyzing.add(record.id);

        try {
          // Timeout: 10s per image — skip if too slow
          const result = await Promise.race([
            analyzeImage(record.image_url),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), 10000)
            ),
          ]);

          const { ok } = await updatePhotoAnalysis(record.id, {
            dominant_hex: result.dominant_hex,
            dominant_name: result.dominant_name,
            dominant_colors: result.merged_clusters,
            visual_color: result.visual_color,
            color_tags: result.color_tags,
          });
          if (ok) updated++;
        } catch (e) {
          console.error(`[auto-analyze] failed ${record.id.slice(0, 8)} (${record.image_url?.slice(0, 40)}…):`, e);
        } finally {
          analyzing.delete(record.id);
        }
      }

      if (!cancelled) {
        // Refresh images to pick up new visual_color/color_tags
        const freshRecords = await fetchPhotos();
        setImages(freshRecords.map(recordToImageData));
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Read `?color=` query param on mount and auto-select that filter
  useEffect(() => {
    const colorParam = searchParams.get("color");
    if (colorParam) {
      const match = CATEGORIES.find(
        (cat) => cat.name.toLowerCase() === colorParam.toLowerCase()
      );
      if (match) {
        setActiveFilter(match.name);
      }
    }
    // Only run once on mount; subsequent manual clicks override
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter]);

  // Only show images when a color filter is active
  const filteredImages = useMemo(() => {
    if (activeFilter === null) return [];
    return images.filter((img) => {
      // Each image has exactly one primary color tag
      const primaryColor = img.visual_color || img.color_tags?.[0] || img.color_name;
      return primaryColor === activeFilter;
    });
  }, [images, activeFilter]);

  const displayImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const hasMore = visibleCount < filteredImages.length;

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string, storagePath: string | null) => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.confirm("Delete this image?")) return;

      setDeleteError(null);

      const result = await deletePhoto(id, storagePath ?? "");
      if (!result.ok) {
        setDeleteError(result.storageError ?? "Failed to delete image");
        return;
      }

      // Immediately update UI
      setImages((prev) => prev.filter((img) => img.id !== id));

      if (result.storageError) {
        setDeleteError(result.storageError);
      }
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  // ── Hover color editing state and handlers ──
  const [hoverCardId, setHoverCardId] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string>("");
  const [hoverSavingId, setHoverSavingId] = useState<string | null>(null);
  const [hoverResettingId, setHoverResettingId] = useState<string | null>(null);
  const [mobileEditId, setMobileEditId] = useState<string | null>(null);

  const handleMouseEnter = useCallback((img: ImageData) => {
    setHoverCardId(img.id);
    setHoverColor(img.visual_color || img.color_tags?.[0] || img.color_name || "");
    setMobileEditId(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverSavingId || hoverResettingId) return;
    setHoverCardId(null);
  }, [hoverSavingId, hoverResettingId]);

  const handleHoverSave = useCallback(async (e: React.MouseEvent, img: ImageData) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hoverColor || hoverColor === (img.visual_color || img.color_tags?.[0] || img.color_name)) {
      setHoverCardId(null);
      setMobileEditId(null);
      return;
    }
    setHoverSavingId(img.id);
    const { ok } = await updatePhotoVisualColor(img.id, hoverColor);
    if (ok) {
      setImages((prev) =>
        prev.map((p) =>
          p.id === img.id
            ? { ...p, visual_color: hoverColor, color_tags: [hoverColor], manual_color_override: true }
            : p
        )
      );
    }
    setHoverSavingId(null);
    setHoverCardId(null);
    setMobileEditId(null);
  }, [hoverColor]);

  const handleHoverCancel = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverCardId(null);
    setMobileEditId(null);
  }, []);

  const handleHoverReset = useCallback(async (e: React.MouseEvent, img: ImageData) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverResettingId(img.id);
    const { ok } = await resetPhotoManualOverride(img.id);
    if (ok) {
      try {
        const analysis = await analyzeImage(img.image_url);
        await updatePhotoAnalysis(img.id, {
          dominant_hex: analysis.dominant_hex,
          dominant_name: analysis.dominant_name,
          dominant_colors: analysis.merged_clusters,
          visual_color: analysis.visual_color,
          color_tags: analysis.color_tags,
        });
        const records = await fetchPhotos();
        setImages(records.map(recordToImageData));
      } catch (e) {
        console.error("Re-analysis after reset failed:", e);
      }
    }
    setHoverResettingId(null);
    setHoverCardId(null);
    setMobileEditId(null);
  }, []);

  // Compute counts from all images (loading state handled separately)
  const isEmptyGallery = images.length === 0 && !loading;
  const noColorSelected = activeFilter === null;
  const noMatch = activeFilter !== null && filteredImages.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          {pageTitle(activeFilter)}
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-24">
          <p className="text-gray-300 text-sm">Loading gallery…</p>
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
        <div className="mb-10 flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-6 items-start flex-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.name;
              const count = images.filter((img) => {
                // Each image has exactly one primary color tag
                const primaryColor = img.visual_color || img.color_tags?.[0] || img.color_name;
                return primaryColor === cat.name;
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
          <p className="text-gray-300 text-sm">
            No images match this color
          </p>
        </div>
      )}

      {/* Image grid — only when a color is selected and results exist */}
      {!noColorSelected && displayImages.length > 0 && (
        <>
          <div className="masonry-grid" style={{ columnCount: 2, columnGap: 32 }}>
            {displayImages.map((img) => (
              <PhotoCard
                key={img.id}
                img={img}
                hoverColor={hoverColor}
                onColorChange={setHoverColor}
                onSave={handleHoverSave}
                onCancel={handleHoverCancel}
                onReset={handleHoverReset}
                onDelete={handleDelete}
                isSaving={hoverSavingId}
                isResetting={hoverResettingId}
                mobileEditId={mobileEditId}
                onMobileEdit={(im) => {
                  setMobileEditId(im.id);
                  setHoverCardId(im.id);
                  setHoverColor(im.visual_color || im.color_tags?.[0] || im.color_name || "");
                }}
              />
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