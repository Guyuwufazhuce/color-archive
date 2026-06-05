"use client";

import Link from "next/link";
import type { ImageData } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/types";

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/gallery" className="hover:text-gray-600 transition-colors">
          Gallery
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[160px]">
          {photo.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main image */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            <img
              src={photo.src}
              alt={photo.name}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Right info panel */}
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-4">Details</h1>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
              {/* Name */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Name
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {photo.name}
                </div>
              </div>

              {/* Color swatch */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl shadow-sm"
                  style={{ backgroundColor: photo.dominantColor }}
                />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
                    Dominant Color
                  </div>
                  <div className="text-sm font-medium text-gray-900 font-mono">
                    {photo.dominantColor}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Category
                </div>
                <div className="inline-block px-3 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded-full">
                  {photo.category}
                </div>
              </div>

              {/* Palette */}
              {photo.palette && photo.palette.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                    Palette
                  </div>
                  <div className="flex gap-2">
                    {photo.palette.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {photo.palette.map((color, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono text-gray-400 w-8 text-center"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Uploaded
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(photo.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Download */}
          <a
            href={photo.src}
            download={photo.name}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </a>

          {/* Back */}
          <Link
            href="/gallery"
            className="block w-full text-center px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}