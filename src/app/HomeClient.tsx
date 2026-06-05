"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ImageData, DominantColor, ColorCategory } from "@/lib/types";
import { extractDominantColors, determineCategory } from "@/lib/colorAnalysis";

const STORAGE_KEY = "color-archive-images";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadExisting(): ImageData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveImages(images: ImageData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export default function HomeClient() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      setProcessing(true);
      const existing = loadExisting();
      const newImages: ImageData[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        let dominantColors: DominantColor[] = [];
        try {
          dominantColors = await extractDominantColors(dataUrl);
        } catch {
          // fallback: empty colors
        }

        const category: ColorCategory =
          dominantColors.length > 0
            ? determineCategory(dominantColors)
            : "uncategorized";

        newImages.push({
          id: generateId(),
          name: file.name,
          dataUrl,
          dominantColors,
          category,
          manualCategory: null,
        });
      }

      saveImages([...newImages, ...existing]);
      setProcessing(false);
      router.push("/gallery");
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) processFiles(Array.from(files));
    },
    [processFiles]
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-2">
          Color Archive
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Upload images and browse them by color.
        </p>

        <div
          className={`relative border-2 border-dashed rounded-2xl bg-white transition-colors cursor-pointer ${
            dragOver
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          style={{ minHeight: "280px" }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            {processing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Processing...</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  选择图片
                </button>
                <p className="mt-3 text-xs text-gray-400">支持拖拽上传</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}