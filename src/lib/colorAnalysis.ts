// ─── Color Analysis — Multi-Cluster with Percentage ────────

import type { ColorCluster } from "./types";
import type { ImageData } from "./types";

// ─── Helpers ────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function distSq(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

// ─── Downsample image → pixel array ─────────────────────────

function loadImagePixels(
  src: string
): Promise<{ r: number; g: number; b: number }[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 150;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const pixels: { r: number; g: number; b: number }[] = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue; // skip transparent
        pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      }
      resolve(pixels);
    };
    img.onerror = () => reject(new Error("Failed to load image for analysis"));
    img.src = src;
  });
}

// ─── K‑means (K=8, 8 iterations, merge close centroids) ────

interface Centroid {
  r: number; g: number; b: number;
  count: number;
}

function pickCentroids(
  pixels: { r: number; g: number; b: number }[],
  k: number
): Centroid[] {
  const step = Math.max(1, Math.floor(pixels.length / k));
  const out: Centroid[] = [];
  for (let i = 0; i < k && i * step < pixels.length; i++) {
    const p = pixels[i * step];
    out.push({ r: p.r, g: p.g, b: p.b, count: 0 });
  }
  return out;
}

function kMeans(
  pixels: { r: number; g: number; b: number }[],
  k: number,
  iterations = 8
): Centroid[] {
  if (pixels.length === 0) return [];
  let centroids = pickCentroids(pixels, k);

  for (let iter = 0; iter < iterations; iter++) {
    // accumulation buffers
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

    for (const p of pixels) {
      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < centroids.length; i++) {
        const d = distSq(p.r, p.g, p.b, centroids[i].r, centroids[i].g, centroids[i].b);
        if (d < bestD) { bestD = d; bestI = i; }
      }
      sums[bestI].r += p.r;
      sums[bestI].g += p.g;
      sums[bestI].b += p.b;
      sums[bestI].count++;
    }

    for (let i = 0; i < centroids.length; i++) {
      if (sums[i].count > 0) {
        centroids[i] = {
          r: sums[i].r / sums[i].count,
          g: sums[i].g / sums[i].count,
          b: sums[i].b / sums[i].count,
          count: sums[i].count,
        };
      }
    }
  }

  // Remove empty
  centroids = centroids.filter((c) => c.count > 0);

  // Merge close centroids (distance < 40 in RGB)
  const merged: Centroid[] = [];
  const threshold = 40;
  for (const c of centroids) {
    let found = false;
    for (const m of merged) {
      if (distSq(c.r, c.g, c.b, m.r, m.g, m.b) < threshold * threshold) {
        const total = m.count + c.count;
        m.r = (m.r * m.count + c.r * c.count) / total;
        m.g = (m.g * m.count + c.g * c.count) / total;
        m.b = (m.b * m.count + c.b * c.count) / total;
        m.count = total;
        found = true;
        break;
      }
    }
    if (!found) merged.push({ ...c });
  }

  merged.sort((a, b) => b.count - a.count);
  return merged.slice(0, 5);
}

// ─── HSV computation ─────────────────────────────────────────

function toHSV(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max !== min) {
    switch (max) {
      case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60; break;
      case gg: h = ((bb - rr) / d + 2) * 60; break;
      case bb: h = ((rr - gg) / d + 4) * 60; break;
    }
  }
  return { h: ((h % 360) + 360) % 360, s, v };
}

// ─── Single hex → category (18 categories) ──────────────────

export function classifyHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const { h, s: sHSV, v } = toHSV(r, g, b);
  const sPct = sHSV * 100;
  const vPct = v * 100;

  // ── Black: low value ──
  if (vPct <= 20) return "Black";

  // ── White: high value, very low saturation ──
  if (vPct > 88 && sPct < 10) return "White";

  // ── Gray: low saturation, mid value ──
  if (sPct < 10 && vPct > 20 && vPct <= 88) return "Gray";

  // ── Brown: orange/red hues with muted saturation and low-medium value ──
  if (vPct < 55 && sPct < 50) {
    if ((h >= 10 && h < 50)) return "Brown";
    if (h >= 0 && h < 10 && sPct < 40) return "Brown";
    if (h >= 330 && h < 360 && vPct < 40) return "Brown";
  }

  // ── Chromatic: use hue ──
  if (h >= 345 || h < 8) return "Red";
  if (h >= 8 && h < 25) return "Orange";
  if (h >= 25 && h < 43) return "Amber";
  if (h >= 43 && h < 65) return "Yellow";
  if (h >= 65 && h < 85) return "Lime";
  if (h >= 85 && h < 140) return "Green";
  if (h >= 140 && h < 165) return "Mint";
  if (h >= 165 && h < 190) return "Cyan";
  if (h >= 190 && h < 215) return "Sky";
  if (h >= 215 && h < 240) return "Blue";
  if (h >= 240 && h < 265) return "Indigo";
  if (h >= 265 && h < 305) return "Purple";
  if (h >= 305 && h < 330) return "Pink";
  if (h >= 330 && h < 345) return "Rose";

  // fallback
  if (vPct <= 30) return "Black";
  return "Gray";
}

// ─── Full image analysis ────────────────────────────────────

export interface ImageAnalysis {
  dominant_hex: string;
  dominant_name: string;
  clusters: ColorCluster[];
  color_tags: string[];
}

/**
 * Analyze an image: K‑means clustering → percentage → classification.
 */
export async function analyzeImage(dataUrl: string): Promise<ImageAnalysis> {
  const pixels = await loadImagePixels(dataUrl);
  const centroids = kMeans(pixels, 8, 8);
  const total = centroids.reduce((s, c) => s + c.count, 0);

  if (total === 0) {
    return {
      dominant_hex: "#999999",
      dominant_name: "Gray",
      clusters: [],
      color_tags: [],
    };
  }

  const clusters: ColorCluster[] = centroids.map((c) => {
    const hex = rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b));
    return { hex, name: classifyHex(hex), percentage: c.count / total };
  });

  const dominant = clusters[0];

  // Color tags: any cluster ≥ 15 % gets included
  const tagSet = new Set<string>();
  for (const cl of clusters) {
    if (cl.percentage >= 0.15) tagSet.add(cl.name);
  }

  // If nothing met the threshold, take top 2
  if (tagSet.size === 0) {
    for (let i = 0; i < Math.min(2, clusters.length); i++) {
      tagSet.add(clusters[i].name);
    }
  }

  // Always include the dominant cluster's category
  tagSet.add(dominant.name);

  return {
    dominant_hex: dominant.hex,
    dominant_name: dominant.name,
    clusters,
    color_tags: Array.from(tagSet),
  };
}

/**
 * Re‑analyse every image currently in localStorage and persist updates.
 */
export async function reanalyzeAllImages(): Promise<number> {
  const { loadImages, saveImages } = await import("./types");
  const images: ImageData[] = loadImages();
  let updated = 0;

  for (const img of images) {
    if (!img.image_url) continue;
    try {
      const result = await analyzeImage(img.image_url);
      img.color_hex = result.dominant_hex;
      img.color_name = result.dominant_name;
      (img as any).dominant_colors = result.clusters;
      (img as any).color_tags = result.color_tags;
      img.palette = result.clusters.map((c) => c.hex);
      updated++;
    } catch (e) {
      console.warn(`[reanalyze] skip ${img.id}:`, e);
    }
  }

  saveImages(images);
  return updated;
}

// ─── Deprecated wrappers (kept for import compatibility) ────

export async function extractDominantColor(dataUrl: string): Promise<string> {
  const r = await analyzeImage(dataUrl);
  return r.dominant_hex;
}

export async function extractPalette(
  dataUrl: string
): Promise<string[]> {
  const r = await analyzeImage(dataUrl);
  return r.clusters.map((c) => c.hex);
}

export function classifyPalette(_palette: string[], _dominantHex: string): string {
  // Deprecated — keep for old import sites; no longer used in new flow
  return classifyHex(_dominantHex);
}