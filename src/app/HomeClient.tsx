"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ImageCard from "@/components/ImageCard";
import UploadZone from "@/components/UploadZone";
import {
  extractDominantColors,
  determineCategory,
} from "@/lib/colorAnalysis";
import type { ColorCategory, ImageData } from "@/lib/types";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/lib/types";

const STORAGE_KEY = "color-archive-images";

function loadFromStorage(): ImageData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function HomeClient() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeFilter, setActiveFilter] = useState<ColorCategory | "all">(
    "all"
  );
  const [processing, setProcessing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.length > 0) setImages(stored);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch {
      // quota exceeded, silently fail
    }
  }, [images]);

  const processFile = useCallback(async (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const dominantColors = await extractDominantColors(dataUrl, 100);
          const category = determineCategory(dominantColors);
          resolve({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            dataUrl,
            dominantColors,
            category,
            manualCategory: null,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      setProcessing(true);
      const results: ImageData[] = [];
      const batchSize = 3;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((f) => processFile(f))
        );
        for (const result of batchResults) {
          if (result.status === "fulfilled") {
            results.push(result.value);
          }
        }
        if (i + batchSize < files.length) {
          await new Promise((r) => setTimeout(r, 50));
        }
      }
      setImages((prev) => [...results, ...prev]);
      setProcessing(false);
    },
    [processFile]
  );

  const handleDelete = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm("Clear all images?")) {
      setImages([]);
    }
  }, []);

  const handleCategoryChange = useCallback(
    (id: string, category: ColorCategory) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, manualCategory: category } : img
        )
      );
    },
    []
  );

  const groupedImages = useMemo(() => {
    const groups = new Map<ColorCategory, ImageData[]>();
    for (const cat of CATEGORY_ORDER) {
      groups.set(cat, []);
    }
    const effectiveImages = images.map((img) => ({
      ...img,
      effectiveCategory: img.manualCategory ?? img.category,
    }));
    for (const img of effectiveImages) {
      const cat = img.effectiveCategory;
      const arr = groups.get(cat);
      if (arr) arr.push(img);
    }
    return groups;
  }, [images]);

  const filteredGroups = useMemo(() => {
    if (activeFilter === "all") return groupedImages;
    const filtered = new Map<ColorCategory, ImageData[]>();
    for (const [cat, imgs] of groupedImages) {
      filtered.set(cat, cat === activeFilter ? imgs : []);
    }
    return filtered;
  }, [groupedImages, activeFilter]);

  const handleExport = useCallback(() => {
    const data = images.map((img) => ({
      name: img.name,
      category: img.manualCategory ?? img.category,
      dominantColors: img.dominantColors.map((c) => ({
        hex: c.hex,
        percentage: c.percentage,
      })),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `color-archive-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [images]);

  const totalCount = images.length;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      {/* Upload zone */}
      <div className="mb-6">
        <UploadZone onFiles={handleFiles} />
        {processing && (
          <div className="mt-3 text-center text-sm text-gray-500">
            Processing images...
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <>
          {/* Action bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs text-gray-400">
              {totalCount} image{totalCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeFilter === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                All ({totalCount})
              </button>
              {CATEGORY_ORDER.map((cat) => {
                const count = groupedImages.get(cat)?.length ?? 0;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                      activeFilter === cat
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    />
                    {CATEGORY_LABELS[cat]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Groups */}
          {CATEGORY_ORDER.map((cat) => {
            const items = filteredGroups.get(cat) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs text-gray-400">{items.length}</span>
                </div>
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                  {items.map((img) => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      onDelete={handleDelete}
                      onCategoryChange={handleCategoryChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {totalCount === 0 && !processing && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Upload some images to get started
        </div>
      )}
    </section>
  );
}