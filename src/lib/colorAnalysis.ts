// ─── Color Analysis — Cluster → Classify → Merge by Name ────────

import type { ColorCluster } from "./types";

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
      const maxDim = 200;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      // Minimum dimension check: if too small, just use original
      if (w < 2 || h < 2) return resolve([]);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.imageSmoothingEnabled = false;
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

// ─── K‑means (K=12, 10 iterations, merge close centroids) ──

interface Centroid {
  r: number; g: number; b: number;
  count: number;
}

function pickCentroids(
  pixels: { r: number; g: number; b: number }[],
  k: number
): Centroid[] {
  if (pixels.length === 0) return [];
  const out: Centroid[] = [];
  const first = pixels[Math.floor(Math.random() * pixels.length)];
  out.push({ r: first.r, g: first.g, b: first.b, count: 0 });

  for (let c = 1; c < k; c++) {
    let bestD2 = 0;
    let bestIdx = 0;
    const candidates = Math.min(10, pixels.length);
    for (let t = 0; t < candidates; t++) {
      const idx = Math.floor(Math.random() * pixels.length);
      const p = pixels[idx];
      let minD2 = Infinity;
      for (const cent of out) {
        const d2 = distSq(p.r, p.g, p.b, cent.r, cent.g, cent.b);
        if (d2 < minD2) minD2 = d2;
      }
      if (minD2 > bestD2) { bestD2 = minD2; bestIdx = idx; }
    }
    const p = pixels[bestIdx];
    out.push({ r: p.r, g: p.g, b: p.b, count: 0 });
  }

  return out;
}

function kMeans(
  pixels: { r: number; g: number; b: number }[],
  k: number,
  iterations = 10
): Centroid[] {
  if (pixels.length === 0) return [];
  let centroids = pickCentroids(pixels, k);

  for (let iter = 0; iter < iterations; iter++) {
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

  // Remove empty centroids
  centroids = centroids.filter((c) => c.count > 0);

  // Merge close centroids (distance < 30 in RGB)
  const merged: Centroid[] = [];
  const threshold = 30;
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
  return merged.slice(0, 12); // keep up to 12 clusters
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

// ─── Single hex → category name ────────────────────────────
// Process: HSV → classify by hue with priority rules.
// Pink (h 330-15, sat > 0.18, v > 0.45) checked before Red/Brown.

export function classifyHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const { h, s, v } = toHSV(r, g, b);

  // ── Black: brightness < 0.15 ──
  if (v < 0.15) return "Black";

  // ── White: brightness > 0.85 ──
  if (v > 0.85) return "White";

  // ── Gray: saturation < 0.10 ──
  if (s < 0.10) return "Gray";

  // ── Pink (hue 330–360 or 0–15, sat > 0.18, v > 0.45)
  //     Must be checked BEFORE Red/Brown to catch pinkish hues
  if ((h >= 330 || h < 15) && s > 0.18 && v > 0.45) return "Pink";

  // ── Brown: warm hues with low saturation and low-medium value ──
  if (v < 0.55 && s < 0.50) {
    if (h >= 10 && h < 50) return "Brown";
    if (h >= 0 && h < 10 && s < 0.40) return "Brown";
    if (h >= 330 && h < 360 && v < 0.35) return "Brown";
  }

  // ── Chromatic: classify by hue ──
  if (h >= 345 || (h >= 0 && h < 8)) return "Red";
  if (h >= 8 && h < 25) return "Orange";
  if (h >= 25 && h < 43) return "Amber";
  if (h >= 43 && h < 70) return "Yellow";
  if (h >= 70 && h < 85) return "Lime";
  if (h >= 85 && h < 165) return "Green";
  if (h >= 165 && h < 190) return "Cyan";
  if (h >= 190 && h < 215) return "Sky";
  if (h >= 215 && h < 240) return "Blue";
  if (h >= 240 && h < 265) return "Indigo";
  if (h >= 265 && h < 305) return "Purple";
  if (h >= 305 && h < 330) return "Pink";
  if (h >= 330 && h < 345) return "Rose";

  // fallback
  if (v <= 0.25) return "Black";
  return "Gray";
}

// ─── Merge clusters by category name ────────────────────────
// After each centroid is classified, merge clusters with the same
// name by summing their percentages. Keep the hex of the largest
// cluster in each group (first encountered since input is sorted).

export function mergeClustersByCategory(clusters: ColorCluster[]): ColorCluster[] {
  const map = new Map<string, { hex: string; percentage: number }>();

  for (const cl of clusters) {
    const existing = map.get(cl.name);
    if (existing) {
      existing.percentage += cl.percentage;
    } else {
      map.set(cl.name, { hex: cl.hex, percentage: cl.percentage });
    }
  }

  return Array.from(map.entries())
    .map(([name, data]) => ({ hex: data.hex, name, percentage: data.percentage }))
    .sort((a, b) => b.percentage - a.percentage);
}

// ─── Smart color tag assignment ─────────────────────────────
//
// Rules:
// 1. Take top 5 merged clusters (by percentage, already sorted)
// 2. Filter: skip any cluster with percentage < 0.15
// 3. Max 2 tags: Primary + Secondary
// 4. If White > 40% → White is primary, pick next ≥15% as secondary
// 5. Otherwise, top 2 remaining clusters as primary & secondary
//
// Color classification thresholds (from classifyHex):
//   White: v > 0.85
//   Black: v < 0.15
//   Gray:  s < 0.10

function assignColorTags(mergedClusters: ColorCluster[]): string[] {
  // Take top 5 (already sorted by percentage descending)
  const top5 = mergedClusters.slice(0, 5);

  // Filter: only clusters with area ≥ 15%
  const significant = top5.filter((c) => c.percentage >= 0.15);

  if (significant.length === 0) {
    // Fallback: just the dominant cluster
    return mergedClusters.length > 0 ? [mergedClusters[0].name] : [];
  }

  // Special rule: if White > 40%, White is primary
  const whiteCluster = significant.find((c) => c.name === "White");
  if (whiteCluster && whiteCluster.percentage > 0.40) {
    const secondary = significant.find((c) => c.name !== "White");
    const tags = ["White"];
    if (secondary) tags.push(secondary.name);
    return tags;
  }

  // Otherwise: top 2 significant clusters
  const tags = significant.slice(0, 2).map((c) => c.name);
  return tags;
}

// ─── Full image analysis ────────────────────────────────────

export interface ImageAnalysis {
  dominant_hex: string;
  dominant_name: string;
  clusters: ColorCluster[];       // Raw clusters (before merging), up to 12
  merged_clusters: ColorCluster[]; // Merged by category name
  color_tags: string[];
}

/**
 * Analyze an image:
 * 1. Downsample → pixel array
 * 2. K-means clustering (K=12, 10 iterations)
 * 3. Classify each centroid by HSV → category name
 * 4. Merge clusters with same name → sum percentages
 * 5. Apply smart color tag rules → color_tags
 */
export async function analyzeImage(dataUrl: string): Promise<ImageAnalysis> {
  const pixels = await loadImagePixels(dataUrl);
  const centroids = kMeans(pixels, 12, 10);
  const total = centroids.reduce((s, c) => s + c.count, 0);

  if (total === 0) {
    return {
      dominant_hex: "#999999",
      dominant_name: "Gray",
      clusters: [],
      merged_clusters: [],
      color_tags: [],
    };
  }

  // Step 1: classify each centroid
  const rawClusters: ColorCluster[] = centroids.map((c) => {
    const hex = rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b));
    return { hex, name: classifyHex(hex), percentage: c.count / total };
  });

  // Step 2: merge by category name
  const mergedClusters = mergeClustersByCategory(rawClusters);

  // Step 3: assign color tags using smart rules
  const color_tags = assignColorTags(mergedClusters);

  return {
    dominant_hex: mergedClusters[0]?.hex ?? "#999999",
    dominant_name: mergedClusters[0]?.name ?? "Gray",
    clusters: rawClusters,
    merged_clusters: mergedClusters,
    color_tags,
  };
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
  return r.merged_clusters.map((c) => c.hex);
}

export function classifyPalette(_palette: string[], _dominantHex: string): string {
  return classifyHex(_dominantHex);
}