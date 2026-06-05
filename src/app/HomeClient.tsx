"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ImageData } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/types";
import { extractDominantColor, extractPalette } from "@/lib/colorAnalysis";
import { classifyHex } from "@/lib/colorAnalysis";
import PendulumBounce from "@/components/PendulumBounce";

type Status = "Processing" | "Done ✅" | "Error ❌" | null;

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

function compressImage(src: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas 2D context unavailable"));

      ctx.drawImage(img, 0, 0, width, height);

      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = mime === "image/png" ? undefined : JPEG_QUALITY;
      const compressed = canvas.toDataURL(mime, quality);

      console.log(`[compress] ${file.name}: ${img.width}x${img.height} → ${width}x${height} (${mime})`);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    img.src = src;
  });
}

export default function HomeClient() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<ImageData[]>([]);

  // Load recent 3 images for preview
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all: ImageData[] = raw ? JSON.parse(raw) : [];
      setRecentImages(all.slice(0, 3));
    } catch {
      setRecentImages([]);
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setStatus("Processing");
      setErrorMsg(null);
      console.log("[upload] Files selected:", files.length);

      const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));

      const jobs = validFiles.map(async (file) => {
        console.log(`[upload] Reading file: ${file.name}`);

        const rawDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const compressedSrc = await compressImage(rawDataUrl, file);
        const dominantColor = await extractDominantColor(compressedSrc);
        const palette = await extractPalette(compressedSrc, 5);
        const category = classifyHex(dominantColor);

        console.log(`[color] ${file.name}: color=${dominantColor} category=${category}`);
        console.log(`[color] ${file.name}: palette=[${palette.join(", ")}]`);

        return {
          id: crypto.randomUUID(),
          name: file.name,
          src: compressedSrc,
          dominantColor,
          category,
          palette,
          createdAt: Date.now(),
        } satisfies ImageData;
      });

      Promise.all(jobs)
        .then((newImages) => {
          const existing: ImageData[] = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
          );
          const all = [...newImages, ...existing];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
          setRecentImages(newImages.slice(0, 3));

          console.log(`[storage] Saved ${newImages.length} image(s), total ${all.length}`);
          setStatus("Done ✅");

          setTimeout(() => {
            console.log("[router] Navigating to /gallery");
            router.push("/gallery");
          }, 400);
        })
        .catch((err) => {
          console.error("[upload] Error:", err);
          setStatus("Error ❌");
          setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        });
    },
    [router]
  );

  const triggerUpload = () => {
    document.getElementById("upload-input")?.click();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">
          Color Archive
        </h1>
        <p className="text-sm text-gray-400">
          Upload images, extract colors, build your palette library
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className="mb-6">
          <span
            className={`text-sm font-mono tracking-wide ${
              status === "Error ❌"
                ? "text-red-500"
                : status === "Done ✅"
                  ? "text-green-600"
                  : "text-gray-400"
            }`}
          >
            {status}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 text-xs text-red-400 text-center max-w-xs">{errorMsg}</div>
      )}

      {/* Big upload card */}
      <div
        onClick={triggerUpload}
        className="w-full max-w-md cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-gray-400 hover:bg-gray-50 transition-all"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4 text-gray-300"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-gray-500 mb-1">Click to upload images</p>
        <p className="text-xs text-gray-400">PNG, JPEG, WEBP</p>
      </div>

      <input
        id="upload-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Pendulum bounce animation */}
      <div className="mt-8">
        <PendulumBounce />
      </div>

      {/* Recent color swatches preview */}
      {recentImages.length > 0 && (
        <div className="mt-10 flex items-center gap-2">
          {recentImages.map((img) => (
            <div
              key={img.id}
              className="w-8 h-8 rounded-lg shadow-sm"
              style={{ backgroundColor: img.dominantColor }}
              title={img.dominantColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}