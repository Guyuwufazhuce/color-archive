"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { PhotoRecord, ColorCategory } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { CATEGORY_COLORS, CATEGORY_ORDER } from "@/lib/types";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { useLanguage } from "@/lib/LanguageContext";

const PAGE_SIZE = 24;

export default function CollectionClient({
  colorSlug,
}: {
  colorSlug: string;
}) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const category = colorSlug as ColorCategory;
  const label = t(`colorFamilies.${category}`);
  const colorHex = CATEGORY_COLORS[category] || "#000";

  const loadPhotos = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("color_family", colorSlug)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Collection load error:", error);
      return;
    }

    if (!data || data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    if (data) {
      setPhotos((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const newOnes = data.filter((p) => !existing.has(p.id));
        return [...prev, ...newOnes];
      });
    }
  }, [colorSlug]);

  useEffect(() => {
    loadPhotos(0).finally(() => setLoading(false));
  }, [loadPhotos]);

  useEffect(() => {
    if (page === 0) return;
    loadPhotos(page);
  }, [page, loadPhotos]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const otherColors = CATEGORY_ORDER.filter((c) => c !== category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-6 h-6 rounded-lg"
            style={{ backgroundColor: colorHex }}
          />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {t("collection.title", { label })}
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          {t("collection.subtitle", { label: label.toLowerCase() })}
        </p>
      </div>

      {/* Color filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {otherColors.map((c) => (
          <Link
            key={c}
            href={`/collection/${c}`}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[c] }}
            />
            {t(`colorFamilies.${c}`)}
          </Link>
        ))}
      </div>

      {/* Photo grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/photo/${photo.id}`}
            className="block mb-4 break-inside-avoid group"
          >
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photo.image_url}
                alt={`${label} photo with dominant color ${photo.dominant_hex}`}
                className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: photo.dominant_hex }}
                  />
                  <span className="text-[11px] text-white font-medium">
                    {photo.dominant_hex}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />

      {loading && (
        <div className="text-center py-8 text-sm text-gray-400">
          {t("collection.loading")}
        </div>
      )}

      {!loading && photos.length === 0 && (
        <div className="text-center py-16 text-sm text-gray-400">
          {t("collection.empty", { label: label.toLowerCase() })}
        </div>
      )}

      {!hasMore && photos.length > 0 && (
        <div className="text-center py-8 text-xs text-gray-400">
          {t("collection.end")}
        </div>
      )}

      <AdsPlaceholder format="banner" className="mt-10" />
    </div>
  );
}