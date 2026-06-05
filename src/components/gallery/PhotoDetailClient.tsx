"use client";

import Link from "next/link";
import type { ImageData, ColorCategory } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import AdsPlaceholder from "@/components/AdsPlaceholder";

const STORAGE_KEY = "color-archive-images";

function loadImage(id: string): ImageData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const images: ImageData[] = raw ? JSON.parse(raw) : [];
    return images.find((img) => img.id === id) || null;
  } catch {
    return null;
  }
}

export default function PhotoDetailClient({ id }: { id: string }) {
  const photo = loadImage(id);

  if (!photo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm">Image not found.</p>
        <Link
          href="/gallery"
          className="inline-block mt-4 text-xs text-gray-500 underline hover:text-gray-700 transition-colors"
        >
          Back to Gallery
        </Link>
      </div>
    );
  }

  const hex = photo.dominantColors[0]?.hex || "#ccc";
  const family = photo.category as ColorCategory;
  const label = CATEGORY_LABELS[family] || "Uncategorized";
  const swatchColor = CATEGORY_COLORS[family] || "#ccc";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/gallery" className="hover:text-gray-600 transition-colors">
          Gallery
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[120px]">
          {photo.id.slice(0, 8)}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main image */}
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden bg-gray-100">
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-4">Details</h1>

            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              {/* HEX swatch */}
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: hex }}
                />
                <div>
                  <div className="text-xs text-gray-400">Dominant Color</div>
                  <div className="text-sm font-medium text-gray-900 font-mono">
                    {hex}
                  </div>
                </div>
              </div>

              {/* Color family */}
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: swatchColor }}
                >
                  <span className="text-[8px] font-bold text-white mix-blend-difference">
                    {label[0]}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Color Family</div>
                  <div className="text-sm font-medium text-gray-900">
                    {label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download button */}
          <a
            href={photo.dataUrl}
            download={photo.name}
            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Download Image
          </a>
        </div>
      </div>

      {/* Ad — bottom of photo detail page */}
      <AdsPlaceholder format="leaderboard" className="mt-10" />
    </div>
  );
}