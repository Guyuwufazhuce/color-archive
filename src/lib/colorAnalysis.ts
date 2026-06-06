// ─── Color Analysis — Visual Score Based Classification ─────
//
// Each image gets exactly one primary color classification,
// determined by a visual score combining:
//   Area % × Saturation Boost × Value Boost × Center Weight × Category Boost
//
// Achromatic (Gray/White/Black) only win when combined area > 70%.
// Otherwise, the most visually prominent chromatic color is selected.
// This prevents photography images (gray sky + muted foreground)
// from being incorrectly classified as Gray.

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

// ─── Downsample image → pixel array (with position) ────────

interface Pixel {
  r: number; g: number; b: number;
  x: number; y: number; // normalized [0, 1]
}

function loadImagePixels(src: string): Promise<Pixel[]> {
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
      const pixels: Pixel[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 128) continue;
          pixels.push({
            r: data[i], g: data[i + 1], b: data[i + 2],
            x: x / w, y: y / h,
          });
        }
      }
      resolve(pixels);
    };
    img.onerror = () => reject(new Error("Failed to load image for analysis"));
    img.src = src;
  });
}

// ─── K‑means (K=12, 10 iterations, position-aware) ─────────

interface Centroid {
  r: number; g: number; b: number;
  count: number;
  sumX: number; sumY: number; // for computing average position
  avgX: number; avgY: number; // average pixel position [0, 1]
}

function pickCentroids(pixels: Pixel[], k: number): Centroid[] {
  if (pixels.length === 0) return [];
  const out: Centroid[] = [];
  const first = pixels[Math.floor(Math.random() * pixels.length)];
  out.push({ r: first.r, g: first.g, b: first.b, count: 0, sumX: 0, sumY: 0, avgX: 0.5, avgY: 0.5 });

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
    out.push({ r: p.r, g: p.g, b: p.b, count: 0, sumX: 0, sumY: 0, avgX: 0.5, avgY: 0.5 });
  }

  return out;
}

function kMeans(pixels: Pixel[], k: number, iterations = 10): Centroid[] {
  if (pixels.length === 0) return [];
  let centroids = pickCentroids(pixels, k);

  for (let iter = 0; iter < iterations; iter++) {
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0, sumX: 0, sumY: 0 }));

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
      sums[bestI].sumX += p.x;
      sums[bestI].sumY += p.y;
    }

    centroids = centroids.map((c, i) => {
      if (sums[i].count > 0) {
        return {
          r: sums[i].r / sums[i].count,
          g: sums[i].g / sums[i].count,
          b: sums[i].b / sums[i].count,
          count: sums[i].count,
          sumX: sums[i].sumX,
          sumY: sums[i].sumY,
          avgX: sums[i].sumX / sums[i].count,
          avgY: sums[i].sumY / sums[i].count,
        };
      }
      return c;
    });
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
        m.sumX += c.sumX;
        m.sumY += c.sumY;
        m.avgX = m.sumX / m.count;
        m.avgY = m.sumY / m.count;
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

export function classifyHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const { h, s, v } = toHSV(r, g, b);

  // ── Black ──
  if (v < 0.15) return "Black";

  // ── Low-saturation guard: s < 0.25 ──
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

  // Green
  if (h >= 85 && h < 165) {
    if (s >= 0.30) return "Green";
    return "Gray";
  }

  // Cyan
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

// ─── Visual Score Computation ───────────────────────────────
//
// Combines:
//   - Area percentage       (larger areas score higher)
//   - Saturation boost      (vivid colors = more visually striking)
//   - Value/brightness      (very dark/light suppressed)
//   - Center weight         (subject typically near center)
//   - Category boost        (vivid colors promoted, achromatic suppressed)

const CATEGORY_BOOST: Record<string, number> = {
  Red: 1.8,
  Pink: 1.7,
  Rose: 1.5,
  Orange: 1.6,
  Amber: 1.3,
  Yellow: 1.3,
  Lime: 1.2,
  Green: 1.3,
  Mint: 1.1,
  Cyan: 1.4,
  Sky: 1.3,
  Blue: 1.2,
  Indigo: 1.1,
  Purple: 1.3,
  Brown: 0.5,
  Gray: 0.2,
  White: 0.1,
  Black: 0.1,
};

/**
 * Value/brightness boost:
 *   v < 0.15 → 0.1 (near-black shadows)
 *   v < 0.35 → 0.1 → 1.0 (dark but visible)
 *   v ≤ 0.80 → 1.0 (sweet spot)
 *   v > 0.80 → 1.0 → 0.1 (very bright/overexposed)
 */
function valueBoost(v: number): number {
  if (v < 0.15) return 0.1;
  if (v < 0.35) return 0.1 + 4.5 * (v - 0.15);
  if (v <= 0.80) return 1.0;
  return Math.max(0.1, 1.0 - 4.5 * (v - 0.80));
}

function computeVisualScore(
  percentage: number,
  hex: string,
  name: string,
  centerWeight: number
): number {
  const { r, g, b } = parseHex(hex);
  const { s, v } = toHSV(r, g, b);

  // Saturation boost: 0.2 at s=0, 1.0 at s=1
  const satBoost = 0.2 + 0.8 * s;

  // Value (brightness) boost
  const valBoostVal = valueBoost(v);

  // Category boost
  const catBoost = CATEGORY_BOOST[name] ?? 0.5;

  return percentage * satBoost * valBoostVal * centerWeight * catBoost;
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

// ─── Pick dominant by visual score ───────────────────────────
//
// Gray/White/Black only win when combined percentage > 70%.
// Otherwise, the most visually prominent chromatic color wins.
//
// Visual score = area% × satBoost × valBoost × centerWeight × catBoost
// This prevents large gray/white areas from dominating photography images.

function pickDominantByVisualScore(
  mergedClusters: ColorCluster[],
  clusterCenterWeights: Map<string, number>
): { hex: string; name: string } {
  if (mergedClusters.length === 0) return { hex: "#999999", name: "Gray" };

  const achromatic = new Set(["Gray", "White", "Black"]);

  // Total achromatic percentage
  const achromaticPct = mergedClusters
    .filter((c) => achromatic.has(c.name))
    .reduce((s, c) => s + c.percentage, 0);

  // Rule: Gray/White/Black only when they dominate > 70% of the image
  if (achromaticPct > 0.70) {
    // Sort achromatic by percentage descending, pick top
    const achromaticSorted = mergedClusters
      .filter((c) => achromatic.has(c.name))
      .sort((a, b) => b.percentage - a.percentage);
    return { hex: achromaticSorted[0].hex, name: achromaticSorted[0].name };
  }

  // Compute visual score for each merged cluster
  const scored = mergedClusters.map((c) => {
    const cw = clusterCenterWeights.get(c.name) ?? 1.0;
    return {
      ...c,
      visualScore: computeVisualScore(c.percentage, c.hex, c.name, cw),
    };
  });

  // Sort by visual score descending
  scored.sort((a, b) => b.visualScore - a.visualScore);

  // Pick the highest-scoring chromatic color
  for (const s of scored) {
    if (!achromatic.has(s.name)) {
      return { hex: s.hex, name: s.name };
    }
  }

  // Fallback: if no chromatic exists (monochrome image), use percentage
  return { hex: mergedClusters[0].hex, name: mergedClusters[0].name };
}

// ─── Single dominant tag ───────────────────────────────────

function assignColorTags(dominantName: string): string[] {
  return [dominantName];
}

// ─── Full image analysis ────────────────────────────────────

export interface ImageAnalysis {
  dominant_hex: string;
  dominant_name: string;
  clusters: ColorCluster[];
  merged_clusters: ColorCluster[];
  color_tags: string[];
}

function fallbackResult(): ImageAnalysis {
  return {
    dominant_hex: "#999999",
    dominant_name: "Gray",
    clusters: [],
    merged_clusters: [],
    color_tags: ["Gray"],
  };
}

/**
 * Analyze an image:
 * 1. Downsample → pixel array (with position tracking)
 * 2. K-means clustering (K=12, 10 iterations, position-aware)
 * 3. Classify each centroid by HSV → category name
 * 4. Merge centroids with same name, aggregate center weight
 * 5. Compute visual score per merged category:
 *      area% × satBoost × valBoost × centerWeight × catBoost
 * 6. Select dominant:
 *      Achromatic only wins if combined >70%.
 *      Otherwise, highest-scoring chromatic color wins.
 * 7. Return single-element color_tags
 */
export async function analyzeImage(dataUrl: string): Promise<ImageAnalysis> {
  const pixels = await loadImagePixels(dataUrl);
  const centroids = kMeans(pixels, 12, 10);
  const total = centroids.reduce((s, c) => s + c.count, 0);

  if (total === 0) return fallbackResult();

  // Step 1: compute center weight per centroid
  // centerDist = 0 at center, 1 at farthest corner
  // centerWeight = 1.0 + 0.5 × (1 - centerDist) → [1.0, 1.5]
  // ≈ 1.5 at center, 1.0 at edges/corners
  const classifiedCentroids = centroids.map((c) => {
    const cx = c.avgX;
    const cy = c.avgY;
    const centerDist = Math.sqrt((cx - 0.5) ** 2 + (cy - 0.5) ** 2) * Math.SQRT2;
    const centerWeight = 1.0 + 0.5 * (1 - Math.min(1, centerDist));
    const hex = rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b));
    const name = classifyHex(hex);
    return {
      hex,
      name,
      percentage: c.count / total,
      centerWeight,
      count: c.count,
    };
  });

  // Step 2: merge by category name, tracking aggregated center weight
  const mergeMap = new Map<
    string,
    { hex: string; percentage: number; centerWeight: number; count: number }
  >();
  for (const c of classifiedCentroids) {
    const existing = mergeMap.get(c.name);
    if (existing) {
      const newCount = existing.count + c.count;
      existing.centerWeight =
        (existing.centerWeight * existing.count + c.centerWeight * c.count) / newCount;
      existing.percentage += c.percentage;
      existing.count = newCount;
    } else {
      mergeMap.set(c.name, {
        hex: c.hex,
        percentage: c.percentage,
        centerWeight: c.centerWeight,
        count: c.count,
      });
    }
  }

  const mergedClusters: ColorCluster[] = [];
  const clusterCenterWeights = new Map<string, number>();
  for (const [name, data] of mergeMap) {
    mergedClusters.push({ hex: data.hex, name, percentage: data.percentage });
    clusterCenterWeights.set(name, data.centerWeight);
  }
  mergedClusters.sort((a, b) => b.percentage - a.percentage);

  // Step 3: rawClusters (for detail view)
  const rawClusters: ColorCluster[] = classifiedCentroids.map((c) => ({
    hex: c.hex,
    name: c.name,
    percentage: c.percentage,
  }));

  // Step 4: Pick dominant by visual score
  const { hex: dominantHex, name: dominantName } = pickDominantByVisualScore(
    mergedClusters,
    clusterCenterWeights
  );

  // Step 5: color_tags = single dominant
  const color_tags = assignColorTags(dominantName);

  return {
    dominant_hex: dominantHex,
    dominant_name: dominantName,
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

export async function extractPalette(dataUrl: string): Promise<string[]> {
  const r = await analyzeImage(dataUrl);
  return r.merged_clusters.map((c) => c.hex);
}

export function classifyPalette(_palette: string[], _dominantHex: string): string {
  return classifyHex(_dominantHex);
}