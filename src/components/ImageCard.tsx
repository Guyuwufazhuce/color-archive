"use client";

import type { ColorCategory, ImageData } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/types";

interface ImageCardProps {
  image: ImageData;
  onDelete: (id: string) => void;
  onCategoryChange: (id: string, category: ColorCategory) => void;
  onPublish?: (id: string) => void;
  publishing?: boolean;
}

export default function ImageCard({
  image,
  onDelete,
  onCategoryChange,
  onPublish,
  publishing,
}: ImageCardProps) {
  const primaryColor = image.dominantColors[0];
  const category = image.manualCategory ?? image.category;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 break-inside-avoid mb-4">
      {/* Image preview */}
      <div className="relative group">
        <img
          src={image.dataUrl}
          alt={image.name}
          className="w-full h-auto object-cover"
        />
        <button
          onClick={() => onDelete(image.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 text-sm"
          title="Delete"
        >
          ✕
        </button>

        {/* Published badge */}
        {image.published && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-medium">
            Published
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3 space-y-2">
        {/* Dominant colors */}
        <div className="flex gap-1">
          {image.dominantColors.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-gray-200"
              style={{ backgroundColor: c.hex }}
              title={`${c.hex} (${c.percentage}%)`}
            />
          ))}
        </div>

        {/* Primary color swatch + category */}
        <div className="flex items-center gap-2">
          {primaryColor && (
            <div
              className="w-6 h-6 rounded-md border border-gray-200 flex-shrink-0"
              style={{ backgroundColor: primaryColor.hex }}
            />
          )}
          <span className="text-xs font-medium text-gray-500">
            {CATEGORY_LABELS[category]}
          </span>
        </div>

        {/* Category selector */}
        <select
          value={category}
          onChange={(e) =>
            onCategoryChange(image.id, e.target.value as ColorCategory)
          }
          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        {/* Publish button */}
        {onPublish && !image.published && (
          <button
            onClick={() => onPublish(image.id)}
            disabled={publishing}
            className="w-full text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {publishing ? "Publishing..." : "Publish to Gallery"}
          </button>
        )}
      </div>
    </div>
  );
}