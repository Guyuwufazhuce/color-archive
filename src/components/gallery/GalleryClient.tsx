"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { PhotoRecord } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import AdsPlaceholder from "@/components/AdsPlaceholder";

const PAGE_SIZE = 24;

export default function GalleryClient() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPhotos = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Gallery load error:", error);
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
  }, []);

  useEffect(() => {
    loadPhotos(0).finally(() => setLoading(false));
  }, [loadPhotos]);

  useEffect(() => {
    if (page === 0) return;
    loadPhotos(page);
  }, [page, loadPhotos]);

  // Infinite scroll observer
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
          Gallery
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          All community photos organized by color. Upload yours to contribute.
        </p>
      </div>

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
                alt={`Photo with dominant color ${photo.dominant_hex}`}
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

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-10" />

      {loading && (
        <div className="text-center py-8 text-sm text-gray-400">
          Loading photos...
        </div>
      )}

      {!loading && photos.length === 0 && (
        <div className="text-center py-16 text-sm text-gray-400">
          No photos yet. Be the first to upload!
        </div>
      )}

      {!hasMore && photos.length > 0 && (
        <div className="text-center py-8 text-xs text-gray-400">
          You&apos;ve reached the end — check back for new uploads
        </div>
      )}

      <AdsPlaceholder format="banner" className="mt-10" />
    </div>
  );
}