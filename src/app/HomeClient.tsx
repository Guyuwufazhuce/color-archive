"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { ImageData } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/types";
import { extractDominantColor } from "@/lib/colorAnalysis";
import { classifyHex } from "@/lib/colorAnalysis";

type Status = "Ready" | "Selected" | "Processing" | "Done ✅" | "Error ❌";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

/**
 * Compress an image via canvas: max side 1200px, JPEG quality 0.8.
 * Returns a data URL string.
 */
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
      if (!ctx) {
        return reject(new Error("Canvas 2D context unavailable"));
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG for photos, but fall back to original MIME for PNGs
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = mime === "image/png" ? undefined : JPEG_QUALITY;
      const compressed = canvas.toDataURL(mime, quality);

      console.log(
        `[compress] ${file.name}: ${img.width}x${img.height} → ${width}x${height} (${mime})`
      );
      resolve(compressed);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    img.src = src;
  });
}

export default function HomeClient() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("Ready");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setStatus("Selected");
      setErrorMsg(null);
      console.log("[upload] Files selected:", files.length);

      const validFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );

      const jobs = validFiles.map(async (file) => {
        console.log(`[upload] Reading file: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`);

        // Step 1: FileReader → data URL
        const rawDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log(`[FileReader] ${file.name}: loaded (${((reader.result as string).length / 1024 / 1024).toFixed(2)}MB)`);
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            console.error(`[FileReader] Error reading ${file.name}`, reader.error);
            reject(reader.error);
          };
          reader.readAsDataURL(file);
        });

        setStatus("Processing");

        // Step 2: Compress via canvas
        console.log(`[compress] Starting compression for ${file.name}`);
        const compressedSrc = await compressImage(rawDataUrl, file);
        console.log(`[compress] ${file.name}: compressed (${(compressedSrc.length / 1024 / 1024).toFixed(2)}MB)`);

        // Step 3: Extract dominant color
        console.log(`[color] Extracting dominant color for ${file.name}`);
        const dominantColor = await extractDominantColor(compressedSrc);
        console.log(`[color] ${file.name}: dominant color = ${dominantColor}`);

        // Step 4: Classify the color into a category
        const category = classifyHex(dominantColor);
        console.log(`[color] ${file.name}: category = ${category}`);

        return {
          id: crypto.randomUUID(),
          name: file.name,
          src: compressedSrc,
          dominantColor,
          category,
          createdAt: Date.now(),
        } satisfies ImageData;
      });

      Promise.all(jobs)
        .then((newImages) => {
          console.log(`[storage] Saving ${newImages.length} image(s) to localStorage`);

          const existing: ImageData[] = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
          );
          const all = [...newImages, ...existing];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

          console.log(`[storage] localStorage now has ${all.length} image(s)`);
          setStatus("Done ✅");

          // Short delay so user can see the status
          setTimeout(() => {
            console.log("[router] Navigating to /gallery");
            router.push("/gallery");
          }, 400);
        })
        .catch((err) => {
          console.error("[upload] Error during upload pipeline:", err);
          setStatus("Error ❌");
          setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        });
    },
    [router]
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Color Archive
        </h1>
        <p className="text-sm text-gray-400">
          Upload images to build your personal color library.
        </p>
      </div>

      {/* Status display */}
      <div className="mb-6 text-sm font-mono tracking-wide">
        <span
          className={
            status === "Error ❌"
              ? "text-red-500"
              : status === "Done ✅"
                ? "text-green-600"
                : "text-gray-400"
          }
        >
          {status}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-4 text-xs text-red-400 max-w-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Visible native file input */}
      <div className="flex flex-col items-center gap-4">
        <label
          htmlFor="upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
        >
          Choose Images
        </label>

        <input
          id="upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="block max-w-sm text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
      </div>
    </div>
  );
}