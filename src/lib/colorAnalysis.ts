// ─── Color Analysis — Cluster → Classify → Merge by Name ────────
//
// Improved classification logic:
// - Low-saturation guard prevents pale sand/reflections being Yellow
// - Per-color saturation thresholds (Yellow needs s ≥ 0.35)
// - Cyan/Sky priority for water/seascapes
// - Saturation-weighted dominant selection
// - Smart color tags with visual salience scoring

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
        if (data[i + 3] < 128) continue;
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
  return merged.slice(0, 12);
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

/**
 * Compute saturation from a hex string (for scoring).
 */
function hexSaturation(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return toHSV(r, g, b).s;
}

// ─── Single hex → category name ────────────────────────────
//
// Rules:
// 1. Black: value < 0.15
// 2. Low-saturation guard (s < 0.25): → White (v>0.82) / Gray (v≥0.30) / Black
// 3. Brown: warm + dark/muted, before chroma
// 4. Chromatic: per-color saturation thresholds
//    - Yellow: needs s ≥ 0.35, v in [0.35, 0.85]
//    - Orange/Amber/Lime: s ≥ 0.35
//    - Green: s ≥ 0.30
//    - Red, Blue, Purple, Cyan, Sky: s ≥ 0.25 (natural acceptance)

export function classifyHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const { h, s, v } = toHSV(r, g, b);

  // ── Black ──
  if (v < 0.15) return "Black";

  // ── Low-saturation guard: s < 0.25 ──
  // Any desaturated warm/cool region → achromatic
  if (s < 0.25) {
    if (v > 0.82) return "White";
    if (v >= 0.30) return "Gray";
    return "Black";
  }

  // ── Brown: warm hues with moderate saturation, low-medium value ──
  if (v < 0.55 && s < 0.50) {
    if (h >= 10 && h < 50) return "Brown";
    if (h >= 0 && h < 10 && s < 0.40) return "Brown";
    if (h >= 330 && h < 360 && v < 0.45) return "Brown";
  }

  // ── Chromatic: classify by hue with saturation guards ──

  // Red: h 345–15 inclusive
  if (h >= 345 || h < 8) return "Red";

  // Orange
  if (h >= 8 && h < 25) {
    if (s >= 0.35) return "Orange";
    return "Gray";
  }

  // Amber
  if (h >= 25 && h < 43) {
    if (s >= 0.35) return "Amber";
    return "Gray";
  }

  // Yellow — strict: needs s ≥ 0.35 AND value in [0.35, 0.85]
  if (h >= 43 && h < 70) {
    if (s >= 0.35 && v >= 0.35 && v <= 0.85) return "Yellow";
    if (v > 0.82) return "White";
    return "Gray";
  }

  // Lime
  if (h >= 70 && h < 85) {
    if (s >= 0.35) return "Lime";
    return "Gray";
  }

  // Green — slightly lower threshold for natural greens
  if (h >= 85 && h < 165) {
    if (s >= 0.30) return "Green";
    return "Gray";
  }

  // Cyan — water/sky, accept lower saturation
  if (h >= 165 && h < 190) return "Cyan";

  // Sky vs Blue
  if (h >= 190 && h < 215) {
    if (v > 0.45) return "Sky";
    return "Blue";
  }

  // Blue
  if (h >= 215 && h < 240) return "Blue";

  // Indigo
  if (h >= 240 && h < 265) return "Indigo";

  // Purple
  if (h >= 265 && h < 305) return "Purple";

  // Pink
  if (h >= 305 && h < 330) return "Pink";

  // Rose
  if (h >= 330 && h < 345) return "Rose";

  // Fallback
  return "Gray";
}

// ─── Merge clusters by category name ────────────────────────

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

// ─── Compute visual salience score ──────────────────────────
//
// Score = percentage × (saturation^1.5)
//
// This boosts high-saturation colors (vivid red carpet) and
// suppresses large pale areas (sand, reflections, sky haze).
//
// Saturation is clamped to [0.02, 1] to avoid extreme zeros.

function visualSalience(
  percentage: number,
  saturation: number
): number {
  const sat = Math.max(0.02, Math.min(1, saturation));
  return percentage * Math.pow(sat, 1.5);
}

// ─── Smart color tag assignment ─────────────────────────────
//
// 1. Compute visual salience for each merged cluster
// 2. Take top 6 by area, then re-rank by salience
// 3. Keep top 2–3 by salience with minimum threshold
// 4. Always include at least the most salient color
// 5. If White dominates area but a vivid color exists → include both

function assignColorTags(mergedClusters: ColorCluster[]): string[] {
  if (mergedClusters.length === 0) return [];

  // Compute salience for each
  const scored = mergedClusters.map((c) => ({
    name: c.name,
    percentage: c.percentage,
    saturation: hexSaturation(c.hex),
    salience: visualSalience(c.percentage, hexSaturation(c.hex)),
  }));

  // Sort by salience descending
  scored.sort((a, b) => b.salience - a.salience);

  // Take the top cluster by salience always
  const tags: string[] = [scored[0].name];

  // Add additional clusters that meet criteria:
  // - salience >= 0.02 (at least 2% effective area)
  // - not already in tags
  // - limit to total of 3 tags
  for (let i = 1; i < scored.length && tags.length < 3; i++) {
    const c = scored[i];
    if (c.salience < 0.02) continue;
    if (tags.includes(c.name)) continue;
    tags.push(c.name);
  }

  // At most 3 tags
  return tags.slice(0, 3);
}

// ─── Full image analysis ────────────────────────────────────

export interface ImageAnalysis {
  dominant_hex: string;
  dominant_name: string;
  clusters: ColorCluster[];
  merged_clusters: ColorCluster[];
  color_tags: string[];
}

/**
 * Analyze an image:
 * 1. Downsample → pixel array
 * 2. K-means clustering (K=12, 10 iterations)
 * 3. Classify each centroid by HSV → category name
 * 4. Merge clusters with same name → sum percentages
 * 5. Select dominant by visual salience (not just area)
 * 6. Assign smart color tags via salience scoring
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

  // Step 3: pick dominant by visual salience (not pure area)
  const scoredDominants = mergedClusters.map((c) => ({
    ...c,
    salience: visualSalience(c.percentage, hexSaturation(c.hex)),
  }));
  scoredDominants.sort((a, b) => b.salience - a.salience);

  const dominant = scoredDominants[0] ?? mergedClusters[0] ?? { hex: "#999999", name: "Gray" };

  // Step 4: assign smart color tags
  const color_tags = assignColorTags(mergedClusters);

  return {
    dominant_hex: dominant.hex,
    dominant_name: dominant.name,
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
