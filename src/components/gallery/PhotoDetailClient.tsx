"use client";

import Link from "next/link";
import type { PhotoRecord } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import AdsPlaceholder from "@/components/AdsPlaceholder";

export default function PhotoDetailClient({
  photo,
  related,
}: {
  photo: PhotoRecord;
  related: PhotoRecord[];
}) {
  const family = photo.color_family;
  const label = CATEGORY_LABELS[family] || family;
  const hex = CATEGORY_COLORS[family] || "#000";
  const createdDate = new Date(photo.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/gallery" className="hover:text-gray-600 transition-colors">
          Gallery
        </Link>
        <span>/</span>
        <Link
          href={`/collection/${family}`}
          className="hover:text-gray-600 transition-colors"
        >
          {label}
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
              src={photo.image_url}
              alt={`Photo with dominant color ${photo.dominant_hex}`}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-4">
              Photo Details
            </h1>

            {/* Color info card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg"
                  style={{ backgroundColor: photo.dominant_hex }}
                />
                <div>
                  <div className="text-xs text-gray-400">Dominant Color</div>
                  <div className="text-sm font-medium text-gray-900 font-mono">
                    {photo.dominant_hex}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: hex }}
                >
                  <span className="text-[8px] font-bold text-white mix-blend-difference">
                    {label[0]}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Color Family</div>
                  <Link
                    href={`/collection/${family}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {label}
                  </Link>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50">
                <div className="text-xs text-gray-400">Uploaded</div>
                <div className="text-sm text-gray-700">{createdDate}</div>
              </div>
            </div>
          </div>

          {/* Ad slot */}
          <AdsPlaceholder format="rectangle" />

          {/* Schema.org */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ImageObject",
                contentUrl: photo.image_url,
                color: photo.dominant_hex,
                uploadDate: photo.created_at,
              }),
            }}
          />
        </div>
      </div>

      {/* Related photos */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hex }}
            />
            <h2 className="text-sm font-semibold text-gray-700">
              More in {label}
            </h2>
          </div>
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/photo/${r.id}`}
                className="block mb-4 break-inside-avoid group"
              >
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={r.image_url}
                    alt={`Photo ${r.dominant_hex}`}
                    className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}