"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface Photo {
  id: string;
  image_url: string;
  dominant_hex: string;
  color_family: string;
}

export default function LatestUploads() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("photos")
        .select("id, image_url, dominant_hex, color_family")
        .order("created_at", { ascending: false })
        .limit(12);

      if (data) setPhotos(data);
    }
    load();
  }, []);

  if (photos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Latest Uploads
        </h2>
        <Link
          href="/gallery"
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          View all →
        </Link>
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
                alt={`Photo ${photo.dominant_hex}`}
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
    </section>
  );
}