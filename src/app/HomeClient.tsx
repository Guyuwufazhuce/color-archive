"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeImage } from "@/lib/colorAnalysis";
import { uploadPhoto } from "@/lib/galleryService";
import RainbowBridge from "@/components/PendulumBounce";

type Status = "Processing" | "Error ❌" | null;

export default function HomeClient() {
  const [status, setStatus] = useState<Status>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setStatus("Processing");
      setErrorMsg(null);
      console.log("[upload] Files selected:", files.length);

      const validFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );

      const analysisResults: { dominant_name: string; color_tags: string[] }[] = [];

      const jobs = validFiles.map(async (file) => {
        console.log(`[upload] Processing file: ${file.name}`);

        // 1. Analyze color from local data URL
        const rawDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        // Compress for analysis (but upload original file to Storage)
        const compressedSrc = await compressImage(rawDataUrl, file);
        const analysis = await analyzeImage(compressedSrc);

        console.log(`[color] ${file.name}: hex=${analysis.dominant_hex} name=${analysis.dominant_name}`);
        console.log(`[color] ${file.name}: tags=[${analysis.color_tags.join(", ")}]`);

        analysisResults.push({
          dominant_name: analysis.dominant_name,
          color_tags: analysis.color_tags,
        });

        // 2. Upload original file + analysis to Supabase
        const result = await uploadPhoto(file, {
          dominant_hex: analysis.dominant_hex,
          dominant_name: analysis.dominant_name,
          dominant_colors: analysis.merged_clusters,
          color_tags: analysis.color_tags,
        });

        if ("error" in result) {
          throw new Error(result.error);
        }

        console.log(`[upload] Saved to Supabase: ${result.id} — ${result.image_url}`);
      });

      Promise.all(jobs)
        .then(() => {
          console.log(`[upload] Successfully uploaded ${validFiles.length} image(s)`);
          // Redirect to gallery with the last uploaded image's primary color
          const last = analysisResults[analysisResults.length - 1];
          const redirectColor = last?.color_tags?.[0] || last?.dominant_name;
          if (redirectColor) {
            router.push(`/gallery?color=${encodeURIComponent(redirectColor.toLowerCase())}`);
          } else {
            router.push("/gallery");
          }
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
        <h1 className="text-4xl font-bold mb-3">
          <span style={{ color: "#FF9500" }}>Color</span>{" "}
          <span style={{ color: "#00C7BE" }}>Archive</span>
        </h1>
        <p className="text-sm text-gray-400">
          Upload images, extract colors, build your palette library
        </p>
      </div>

      {/* Status - show only errors, success redirects */}
      {status && status === "Error ❌" && (
        <div className="mb-6">
          <span className="text-sm font-mono tracking-wide text-red-500">
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

      {/* Rainbow bridge animation */}
      <div className="mt-12">
        <RainbowBridge />
      </div>
    </div>
  );
}

// ─── Compress helper (moved from original) ──────────────────

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