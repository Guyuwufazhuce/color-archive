// ─── Color Analysis — Visual Score Based Classification v4 ───
//
// Each image gets exactly one primary color classification (visual_color),
// determined by the saturation-weighted scoring:
//   baseScore = area% × saturationWeight (per-color family)
//   finalScore = baseScore × positionWeight
//
// Position weights (centerRatio > 0.5 → ×2.0; edgeRatio > 0.7 → ×0.4; edgeRatio > 0.6 → ×0.5):
//   Prioritizes center subject, penalizes background edges.
//
// Classification adjustments:
// - Red/Pink/Orange: need ≥15% area or ≥10% center area to score normally, else ×0.25
// - White: need ≥45% area AND ≥25% center area, else ×0.2
// - Black: area≥20% OR center≥15% → ×2.0; center≥15% → additional ×1.5
// - Green/Lime: combined >30% area AND center >10% → ×1.8
//
// Chromatic safety: prefers chromatic over achromatic when chromatic score ≥60% of winner.
//
// Key features:
// - Sat weights: Red/Magenta/Orange=1.7, Green/Lime=1.6, Cyan/Blue/Indigo=1.5, Yellow/Amber=1.3,
//   Mint=1.0, Brown=0.3, Gray=0.15, White/Black=0.1
// - Near-gray/white/black noise clusters (very low sat weight) are effectively ignored
// - Auto-analysis skips images where manual_color_override = true
// - color_tags includes the primary visual_color plus any secondary colors ≥8% area
// - manual_color_override field persists user corrections

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
  centerCount: number;        // pixels in center 60% region
  edgeCount: number;          // pixels within 10% of any edge
  topCount: number;           // pixels in top 25% of image
  sumSaturation: number;      // sum of HSV saturation values for avg computation
  sumValue: number;           // sum of HSV value (lightness) values for avg computation
  avgSaturation: number;      // average saturation of this cluster
  avgValue: number;           // average value of this cluster
}

function pickCentroids(pixels: Pixel[], k: number): Centroid[] {
  if (pixels.length === 0) return [];
  const out: Centroid[] = [];
  const first = pixels[Math.floor(Math.random() * pixels.length)];
  out.push({ r: first.r, g: first.g, b: first.b, count: 0, sumX: 0, sumY: 0, avgX: 0.5, avgY: 0.5, centerCount: 0, edgeCount: 0, topCount: 0, sumSaturation: 0, sumValue: 0, avgSaturation: 0, avgValue: 0 });

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
    out.push({ r: p.r, g: p.g, b: p.b, count: 0, sumX: 0, sumY: 0, avgX: 0.5, avgY: 0.5, centerCount: 0, edgeCount: 0, topCount: 0, sumSaturation: 0, sumValue: 0, avgSaturation: 0, avgValue: 0 });
  }

  return out;
}

function kMeans(pixels: Pixel[], k: number, iterations = 10): Centroid[] {
  if (pixels.length === 0) return [];
  let centroids = pickCentroids(pixels, k);

  for (let iter = 0; iter < iterations; iter++) {
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0, sumX: 0, sumY: 0, centerCount: 0, edgeCount: 0, topCount: 0, sumSaturation: 0, sumValue: 0 }));

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
      // Track HSV saturation and value for saturationScore computation
      const { s, v } = toHSV(p.r, p.g, p.b);
      sums[bestI].sumSaturation += s;
      sums[bestI].sumValue += v;
      // Center: within 30% of center (center region = 60% of image)
      if (p.x > 0.2 && p.x < 0.8 && p.y > 0.2 && p.y < 0.8) sums[bestI].centerCount++;
      // Edge: within 10% of any edge
      if (p.x < 0.1 || p.x > 0.9 || p.y < 0.1 || p.y > 0.9) sums[bestI].edgeCount++;
      // Top: top 25%
      if (p.y < 0.25) sums[bestI].topCount++;
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
          centerCount: sums[i].centerCount,
          edgeCount: sums[i].edgeCount,
          topCount: sums[i].topCount,
          sumSaturation: sums[i].sumSaturation,
          sumValue: sums[i].sumValue,
          avgSaturation: sums[i].sumSaturation / sums[i].count,
          avgValue: sums[i].sumValue / sums[i].count,
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
        m.centerCount += c.centerCount;
        m.edgeCount += c.edgeCount;
        m.topCount += c.topCount;
        m.sumSaturation += c.sumSaturation;
        m.sumValue += c.sumValue;
        m.avgSaturation = m.sumSaturation / m.count;
        m.avgValue = m.sumValue / m.count;
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

// ─── Single hex → category name ────────────────────────────
//
// Rules:
// 1. Black: value < 0.15
// 2. Pink/Rose detection (low-saturation pinkish tones): before White guard
//    - If R is significantly higher than G/B AND hue in pink/rose range → Pink/Rose
// 3. White: only truly neutral white
//    - saturation ≤ 0.12 AND value ≥ 0.85 AND no visible hue
//    - If R > G+10 or R > B+10 → not White (likely pinkish/rose)
// 4. Gray: mid-tone low saturation
// 5. Brown: warm + dark/muted
// 6. Chromatic: per-color saturation thresholds

export function classifyHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const { h, s, v } = toHSV(r, g, b);

  // ── Black ──
  if (v < 0.15) return "Black";

  // ── Pink/Rose detection: low-saturation pinkish tones ──
  // If R is clearly higher than G and B, and hue is in pink/rose range,
  // classify as Pink or Rose even at low saturation.
  if (s < 0.30 && v > 0.60) {
    const rDominant = r > g + 10 && r > b + 10;
    if (rDominant) {
      if ((h >= 330 && h < 360) || (h >= 0 && h < 20)) return "Rose";
      if (h >= 305 && h < 330) return "Pink";
    }
  }

  // ── White: only truly neutral white ──
  // saturation ≤ 0.12, value ≥ 0.85, no visible hue
  if (s <= 0.12 && v >= 0.85) {
    const rDominant = r > g + 10 && r > b + 10;
    if (!rDominant) return "White";
    // Tinted white → reclassify by hue
    if ((h >= 330 && h < 360) || (h >= 0 && h < 20)) return "Rose";
    if (h >= 305 && h < 330) return "Pink";
    return "White";
  }

  // ── Low-saturation guard: s < 0.25 (mid-tone gray) ──
  if (s < 0.25) {
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

  // Mint: light/pastel green with high value, low saturation
  // Must be checked before Green (h 85-165) to avoid being caught by Green first
  if (h >= 140 && h < 170 && v > 0.6 && s < 0.45) return "Mint";

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

// ─── Visual Score Computation v5 — Multiplicative Scoring ───
//
// Formula: score = areaScore × saturationScore × centerScore × visualScore
//
// areaScore = color area percentage (0-1)
// saturationScore = based on weighted avg saturation of the cluster:
//   s < 0.15 → 0.3 (washed out)
//   s < 0.30 → 0.5
//   s < 0.50 → 0.8
//   s < 0.70 → 1.0
//   s ≥ 0.70 → 1.2 (vibrant)
// centerScore = center ratio > 0.5 → 1.5, else 1.0
// visualScore = per-category multiplier (see VISUAL_SCORE_MULTIPLIER)
//
// Restrictions:
//   White: must satisfy s < 0.12 AND v > 0.85 AND area > 70% to be visual_color
//   Gray:  must have area > 60% to be visual_color
//
// Boosts:
//   Black area > 40% → score ×2
//   Green+Lime combined > 30% → score ×2
//   Pink+Rose combined > 25% → score ×2

const VISUAL_SCORE_MULTIPLIER: Record<string, number> = {
  White: 0.3,
  Gray: 0.4,
  Black: 1.3,
  Pink: 1.5,
  Rose: 1.5,
  Red: 1.4,
  Orange: 1.3,
  Yellow: 1.2,
  Lime: 1.4,
  Green: 1.4,
  Blue: 1.3,
  Purple: 1.3,
  Amber: 1.0,
  Mint: 1.0,
  Cyan: 1.0,
  Sky: 1.0,
  Indigo: 1.0,
  Brown: 1.0,
};

function computeSaturationScore(avgSaturation: number): number {
  if (avgSaturation < 0.15) return 0.3;
  if (avgSaturation < 0.30) return 0.5;
  if (avgSaturation < 0.50) return 0.8;
  if (avgSaturation < 0.70) return 1.0;
  return 1.2;
}

interface SpatialStats {
  centerWeight: number;
  centerRatio: number;
  edgeRatio: number;
  topRatio: number;
  avgSaturation: number;
  avgValue: number;
}

function pickVisualColor(
  mergedClusters: ColorCluster[],
  clusterSpatialStats: Map<string, SpatialStats>
): { hex: string; name: string } {
  if (mergedClusters.length === 0) return { hex: "#999999", name: "Gray" };

  const stats = (name: string): SpatialStats =>
    clusterSpatialStats.get(name) ?? {
      centerWeight: 1.0,
      centerRatio: 0.5,
      edgeRatio: 0,
      topRatio: 0,
      avgSaturation: 0.5,
      avgValue: 0.5,
    };

  const area = (name: string) =>
    mergedClusters.find((c) => c.name === name)?.percentage ?? 0;

  // ── Step 1: Compute base scores ──
  const scored = mergedClusters.map((c) => {
    const sp = stats(c.name);
    const areaScore = c.percentage;
    const saturationScore = computeSaturationScore(sp.avgSaturation);
    const centerScore = sp.centerRatio > 0.5 ? 1.5 : 1.0;
    const visualScore = VISUAL_SCORE_MULTIPLIER[c.name] ?? 1.0;

    let score = areaScore * saturationScore * centerScore * visualScore;

    return { ...c, visualScore: score };
  });

  // ── Step 2: Apply restrictions ──

  const whiteArea = area("White");
  const grayArea = area("Gray");

  // White restriction: must have s < 0.12 AND v > 0.85 AND area > 70%
  if (whiteArea <= 0.70) {
    const whiteEntry = scored.find((c) => c.name === "White");
    if (whiteEntry) whiteEntry.visualScore = 0;
  } else {
    // Even if area > 70%, check the cluster's actual saturation/value
    const whiteStats = stats("White");
    if (whiteStats.avgSaturation >= 0.12 || whiteStats.avgValue <= 0.85) {
      const whiteEntry = scored.find((c) => c.name === "White");
      if (whiteEntry) whiteEntry.visualScore = 0;
    }
  }

  // Gray restriction: must have area > 60%
  if (grayArea <= 0.60) {
    const grayEntry = scored.find((c) => c.name === "Gray");
    if (grayEntry) grayEntry.visualScore = 0;
  }

  // ── Step 3: Apply boosts ──

  const blackArea = area("Black");
  const greenLimeArea = area("Green") + area("Lime");
  const pinkRoseArea = area("Pink") + area("Rose");

  // Black boost: if Black area > 40% → score ×2
  if (blackArea > 0.40) {
    const blackEntry = scored.find((c) => c.name === "Black");
    if (blackEntry) blackEntry.visualScore *= 2;
  }

  // Green/Lime boost: if combined > 30% → score ×2
  if (greenLimeArea > 0.30) {
    for (const c of scored) {
      if (c.name === "Green" || c.name === "Lime") {
        c.visualScore *= 2;
      }
    }
  }

  // Pink/Rose boost: if combined > 25% → score ×2
  if (pinkRoseArea > 0.25) {
    for (const c of scored) {
      if (c.name === "Pink" || c.name === "Rose") {
        c.visualScore *= 2;
      }
    }
  }

  // ── Step 4: Sort and pick winner ──
  scored.sort((a, b) => b.visualScore - a.visualScore);
  const winner = scored[0];

  return { hex: winner.hex, name: winner.name };
}

// ─── Full image analysis ────────────────────────────────────

export interface ImageAnalysis {
  dominant_hex: string;
  dominant_name: string;
  /** Visually-dominant color (by visual score) — source of truth for classification */
  visual_color: string;
  clusters: ColorCluster[];
  merged_clusters: ColorCluster[];
  /** Alias for merged_clusters — backward compat */
  dominant_colors: ColorCluster[];
  color_tags: string[];
}

function fallbackResult(): ImageAnalysis {
  return {
    dominant_hex: "#FFFFFF",
    dominant_name: "White",
    visual_color: "White",
    clusters: [],
    merged_clusters: [],
    dominant_colors: [],
    color_tags: ["White"],
  };
}

/**
 * Analyze an image and return both pixel-area dominant and visual-score dominant.
 *
 * `dominant_hex` / `dominant_name` = pixel-area winner (for detail reference only)
 * `visual_color`                    = visual-score winner (used for classification / stats / filtering)
 * `color_tags`                      = [visual_color] (single-element array)
 *
 * Visual Score = area×0.5 + centerRatio×0.3 + saturation×0.1 + categoryBoost×0.1 (additive)
 */
export async function analyzeImage(
  dataUrl: string,
  filename?: string
): Promise<ImageAnalysis> {
  const pixels = await loadImagePixels(dataUrl);
  const centroids = kMeans(pixels, 12, 10);
  const total = centroids.reduce((s, c) => s + c.count, 0);

  if (total === 0) return fallbackResult();

  // ── Step 1: classify centroids (carrying spatial data forward) ──
  const classifiedCentroids = centroids.map((c) => {
    const cx = c.avgX;
    const cy = c.avgY;
    const centerDist = Math.sqrt((cx - 0.5) ** 2 + (cy - 0.5) ** 2) * Math.SQRT2;
    const centerWeight = 1.0 + 0.5 * (1 - Math.min(1, centerDist));
    const hex = rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b));
    const name = classifyHex(hex);
    return {
      hex, name,
      percentage: c.count / total,
      centerWeight,
      count: c.count,
      centerCount: c.centerCount,
      edgeCount: c.edgeCount,
      topCount: c.topCount,
      avgSaturation: c.avgSaturation,
      avgValue: c.avgValue,
    };
  });

  // ── Step 2: merge by category name with full spatial tracking ──
  const mergeMap = new Map<
    string,
    {
      hex: string;
      percentage: number;
      centerWeight: number;
      count: number;
      centerCount: number;
      edgeCount: number;
      topCount: number;
      sumSaturation: number;
      sumValue: number;
      avgSaturation: number;
      avgValue: number;
    }
  >();
  for (const c of classifiedCentroids) {
    const existing = mergeMap.get(c.name);
    if (existing) {
      const newCount = existing.count + c.count;
      existing.centerWeight =
        (existing.centerWeight * existing.count + c.centerWeight * c.count) / newCount;
      existing.percentage += c.percentage;
      existing.count = newCount;
      existing.centerCount += c.centerCount;
      existing.edgeCount += c.edgeCount;
      existing.topCount += c.topCount;
      existing.sumSaturation += c.avgSaturation * c.count;
      existing.sumValue += c.avgValue * c.count;
      existing.avgSaturation = existing.sumSaturation / existing.count;
      existing.avgValue = existing.sumValue / existing.count;
    } else {
      mergeMap.set(c.name, {
        hex: c.hex,
        percentage: c.percentage,
        centerWeight: c.centerWeight,
        count: c.count,
        centerCount: c.centerCount,
        edgeCount: c.edgeCount,
        topCount: c.topCount,
        sumSaturation: c.avgSaturation * c.count,
        sumValue: c.avgValue * c.count,
        avgSaturation: c.avgSaturation,
        avgValue: c.avgValue,
      });
    }
  }

  const mergedClusters: ColorCluster[] = [];
  const clusterSpatialStats = new Map<
    string,
    {
      centerWeight: number;
      centerRatio: number; // fraction of this cluster's pixels in center 60% region
      edgeRatio: number;   // fraction within 10% of any edge
      topRatio: number;    // fraction in top 25% of image
      avgSaturation: number;
      avgValue: number;
    }
  >();
  for (const [name, data] of mergeMap) {
    mergedClusters.push({ hex: data.hex, name, percentage: data.percentage });
    clusterSpatialStats.set(name, {
      centerWeight: data.centerWeight,
      centerRatio: data.count > 0 ? data.centerCount / data.count : 0.5,
      edgeRatio: data.count > 0 ? data.edgeCount / data.count : 0,
      topRatio: data.count > 0 ? data.topCount / data.count : 0,
      avgSaturation: data.avgSaturation,
      avgValue: data.avgValue,
    });
  }
  mergedClusters.sort((a, b) => b.percentage - a.percentage);

  // ── Step 3: raw clusters (for detail view) ──
  const rawClusters: ColorCluster[] = classifiedCentroids.map((c) => ({
    hex: c.hex,
    name: c.name,
    percentage: c.percentage,
  }));

  // ── Step 4: area-max winner (pixel-area dominant, detail view only) ──
  const dominantHex = mergedClusters[0].hex;
  const dominantName = mergedClusters[0].name;

  // ── Step 5: visual-color winner (new formula) ──
  const { hex: visHex, name: visName } = pickVisualColor(
    mergedClusters,
    clusterSpatialStats
  );

  // ── Step 6: color_tags — single-element array matching visual_color ──
  const color_tags = [visName];

  // ── Step 7: center ranking for debug ──
  const centerRanking = mergedClusters
    .map((c) => {
      const s = clusterSpatialStats.get(c.name);
      return `${c.name}=center${(s?.centerRatio ?? 0).toFixed(2)}/edge${(s?.edgeRatio ?? 0).toFixed(2)}/top${(s?.topRatio ?? 0).toFixed(2)}`;
    })
    .join(", ");

  // ── Debug output ──
  const areaRanking = mergedClusters
    .map((c) => `${c.name}=${(c.percentage * 100).toFixed(1)}%`)
    .join(", ");

  console.log({
    dominantColor: `${dominantName}(${dominantHex})`,
    visualColor: `${visName}(${visHex})`,
    areaRanking,
    centerRanking,
    color_tags,
  });

  return {
    dominant_hex: dominantHex,
    dominant_name: dominantName,
    visual_color: visName,
    clusters: rawClusters,
    merged_clusters: mergedClusters,
    dominant_colors: mergedClusters,
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