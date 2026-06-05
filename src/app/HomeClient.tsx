"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload } from "lucide-react";
import type { ImageData, DominantColor, ColorCategory } from "@/lib/types";
import { extractDominantColors, determineCategory } from "@/lib/colorAnalysis";

const STORAGE_KEY = "color-archive-images";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadExisting(): ImageData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    console.log("[Upload] localStorage read:", raw ? `${raw.length} chars` : "empty");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("[Upload] localStorage read error:", e);
    return [];
  }
}

function saveImages(images: ImageData[]): void {
  const json = JSON.stringify(images);
  console.log("[Upload] localStorage write:", json.length, "chars for", images.length, "images");
  localStorage.setItem(STORAGE_KEY, json);
}

/** Compress image: max 1200px longest side, JPEG quality 0.8, returns base64 dataUrl */
function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject(new Error("Image load failed during compress"));
    img.src = dataUrl;
  });
}

export default function HomeClient() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      console.log("[Upload] files received:", files.length, files.map(f => f.name));
      setProcessing(true);
      const existing = loadExisting();
      const newImages: ImageData[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          console.log("[Upload] skipping non-image:", file.name, file.type);
          continue;
        }

        console.log("[Upload] reading file:", file.name, file.size, "bytes");
        const rawDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log("[Upload] FileReader.onload success for", file.name);
            resolve(reader.result as string);
          };
          reader.onerror = (e) => {
            console.error("[Upload] FileReader error:", e);
            reject(e);
          };
          reader.readAsDataURL(file);
        });

        // Compress to stay within localStorage quota (~5MB)
        console.log("[Upload] compressing", file.name, `(${(rawDataUrl.length / 1024 / 1024).toFixed(1)}MB)`);
        let dataUrl: string;
        try {
          dataUrl = await compressImage(rawDataUrl);
          console.log("[Upload] compressed to", (dataUrl.length / 1024 / 1024).toFixed(1), "MB");
        } catch (e) {
          console.warn("[Upload] compression failed, using original:", e);
          dataUrl = rawDataUrl;
        }

        console.log("[Upload] extracting dominant colors...");
        let dominantColors: DominantColor[] = [];
        try {
          dominantColors = await extractDominantColors(dataUrl);
          console.log("[Upload] colors extracted:", dominantColors.length, dominantColors.map(c => c.hex));
        } catch (e) {
          console.warn("[Upload] color extraction failed:", e);
        }

        const category: ColorCategory =
          dominantColors.length > 0
            ? determineCategory(dominantColors)
            : "uncategorized";

        console.log("[Upload] category:", category);

        newImages.push({
          id: generateId(),
          name: file.name,
          dataUrl,
          dominantColors,
          category,
          manualCategory: null,
        });
      }

      if (newImages.length === 0) {
        console.warn("[Upload] no valid images processed");
        setProcessing(false);
        return;
      }

      console.log("[Upload] saving", newImages.length, "new images +", existing.length, "existing");
      saveImages([...newImages, ...existing]);

      // Verify storage worked
      const verify = localStorage.getItem(STORAGE_KEY);
      console.log("[Upload] verification read:", verify ? `${verify.length} chars stored OK` : "FAILED - nothing in localStorage!");

      setProcessing(false);
      console.log("[Upload] navigating to /gallery");
      router.push("/gallery");
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      console.log("[Upload] drag drop event");
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      console.log("[Upload] dropped files:", files.length, files.map(f => f.name));
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("[Upload] file input onChange fired");
      const files = e.target.files;
      if (files && files.length > 0) {
        console.log("[Upload] selected files:", files.length, Array.from(files).map(f => f.name));
        processFiles(Array.from(files));
      } else {
        console.log("[Upload] no files selected (cancel?)");
      }
      // Reset input so re-selecting the same file works
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const handleClick = useCallback(() => {
    console.log("[Upload] upload area clicked");
    if (inputRef.current) {
      console.log("[Upload] triggering file input click");
      inputRef.current.click();
    } else {
      console.error("[Upload] inputRef.current is null - input not mounted!");
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center relative group">
        <div
          className={`w-[320px] h-[320px] border-2 border-dashed rounded-2xl bg-white flex items-center justify-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-gray-400 bg-gray-50 scale-[1.02]"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onDragOver={(e) => {
            console.log("[Upload] drag over");
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => {
            console.log("[Upload] drag leave");
            setDragOver(false);
          }}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {processing ? (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <CloudUpload size={48} color="#111" className="group-hover:opacity-70 transition-opacity" />
          )}
        </div>
        <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] text-gray-400 whitespace-nowrap pointer-events-none">
          Click or drag images here
        </div>
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
  );
}