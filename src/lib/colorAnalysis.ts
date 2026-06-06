// ─── Color Analysis — Visual Score Based Classification v2 ───
//
// Each image gets exactly one primary color classification,
// determined by an additive visual score:
//   Area × 0.5 + CenterRatio × 0.3 + Saturation × 0.1 + Category × 0.1
//
// Key features:
// - <8% area threshold: small clusters cannot win unless centerArea > 15%
// - Background penalty: edge/top-heavy clusters get downgraded
// - White priority: White ≥ 35% and largest → White
// - Chromatic safety: prefers chromatic over achromatic at comparable scores
// - Position tracking: centerCount/edgeCount/topCount per centroid from k-means

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
}

function pickCentroids(pixels: Pixel[], k: number): Centroid[] {
  if (pixels.length === 0) return [];
  const out: Centroid[] = [];
  const first = pixels[Math.floor(Math.random() * pixels.length)];
  out.push({ r: first.r, g: first.g, b: first.b, count: 0, sumX: 0, sumY: 0, avgX: 0.5, avgY: 0.5, centerCount: 0, edgeCount: 0, topCount: 0 });

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
    out.push({ r: p.r, g: p.g, b: p.b, count: 0, sumX: 0, sumY: 0, avgX: 0.5, avgY: 0.5, centerCount: 0, edgeCount: 0, topCount: 0 });
  }

  return out;
}

function kMeans(pixels: Pixel[], k: number, iterations = 10): Centroid[] {
  if (pixels.length === 0) return [];
  let centroids = pickCentroids(pixels, k);

  for (let iter = 0; iter < iterations; iter++) {
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0, sumX: 0, sumY: 0, centerCount: 0, edgeCount: 0, topCount: 0 }));

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
// 2. Low-saturation guard (s < 0.25): → White (v>0.82) / Gray (v≥0.30) / Black
// 3. Brown: warm + dark/muted, before chroma
// 4. Chromatic: per-color saturation thresholds

export function classifyHex(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const { h, s, v } = toHSV(r, g, b);

  // ── Black ──
  if (v < 0.15) return "Black";

  // ── Low-saturation guard: s < 0.30 ──
  // Unify White system: White, OffWhite, Ivory, Cream → all White.
  // Prevent light gray from stealing White's classification.
  if (s < 0.30) {
    if (v > 0.72) return "White";       // bright: white / off-white / ivory / cream
    if (s < 0.25 && v > 0.62) return "White"; // slightly darker but still white-ish
  }

  // ── Low-saturation guard: s < 0.25 (mid-tone gray) ──
  // Gray, Neutral Gray, Mid Gray → all "Gray"
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

// ─── Visual Score Computation v2 ────────────────────────────
//
// New formula: Visual Score =
//   AreaWeight × 0.5
//   + CenterWeight × 0.3
//   + SaturationWeight × 0.1
//   + CategoryWeight × 0.1
//
// Area and center (主体) account for 80% of weight.
// Saturation and category are minor, preventing background/small-area hijack.
//
// Area threshold: any cluster < 8% cannot be visual_color unless centerArea > 15%.
// Background penalty: edge/top heavy clusters get downgraded.
// White system unified: White / OffWhite / Ivory / Cream all considered "White".
// White priority: if White system ≥ 35% AND White is the largest group → White.

const NEW_CATEGORY_BOOST: Record<string, number> = {
  Red: 1.3,
  Pink: 1.2,
  Rose: 1.2,
  Orange: 1.2,
  Amber: 1.1,
  Yellow: 1.1,
  Lime: 1.0,
  Green: 1.1,
  Mint: 1.0,
  Cyan: 1.1,
  Sky: 1.0,
  Blue: 1.0,
  Indigo: 1.0,
  Purple: 1.1,
  Brown: 0.6,
  Gray: 0.4,
  White: 0.5,
  Black: 0.3,
};

function computeVisualScoreV2(
  areaPct: number,   // 0-1
  centerRatio: number, // fraction of this cluster's pixels in center 60% region, 0-1
  saturation: number,  // 0-1
  catBoost: number
): number {
  const areaWeight = areaPct * 0.5;
  const centerWeight = centerRatio * 0.3;
  const satWeight = saturation * 0.1;
  const catWeight = catBoost * 0.1;
  return areaWeight + centerWeight + satWeight + catWeight;
}

function computeBackgroundPenalty(
  edgeRatio: number,
  topRatio: number
): number {
  // Penalty multiplier: 1.0 = no penalty, 0.5 = heavy penalty
  // Heavy edge presence → penalize (especially edge + top = sky penalty)
  const edgePenalty = Math.max(0, 1.0 - edgeRatio * 0.6);
  const topPenalty = Math.max(0, 1.0 - topRatio * 0.4);
  // Average of the two, but edge counts more
  return edgePenalty * 0.6 + topPenalty * 0.4;
}

interface SpatialStats {
  centerWeight: number;
  centerRatio: number;
  edgeRatio: number;
  topRatio: number;
}

function pickVisualColor(
  mergedClusters: ColorCluster[],
  clusterSpatialStats: Map<string, SpatialStats>
): { hex: string; name: string } {
  if (mergedClusters.length === 0) return { hex: "#999999", name: "Gray" };

  const achromatic = new Set(["Gray", "White", "Black", "Brown"]);
  const whiteFamily = new Set(["White"]);  // classifyHex already unifies all white variants to "White"

  // Helper to get spatial stats
  const stats = (name: string): SpatialStats =>
    clusterSpatialStats.get(name) ?? {
      centerWeight: 1.0,
      centerRatio: 0.5,
      edgeRatio: 0,
      topRatio: 0,
    };

  const area = (name: string) =>
    mergedClusters.find((c) => c.name === name)?.percentage ?? 0;

  // ── Step A: Compute total White system area (all already mapped to "White") ──
  const totalWhite = area("White");

  // ── Step B: White priority rule ──
  // If White system ≥ 35% AND White is the largest single group → White
  if (totalWhite >= 0.35) {
    const sortedByArea = [...mergedClusters].sort(
      (a, b) => b.percentage - a.percentage
    );
    if (sortedByArea[0].name === "White") {
      return { hex: "#FFFFFF", name: "White" };
    }
  }

  // ── Step C: Compute scores per cluster ──
  const scored = mergedClusters.map((c) => {
    const { r, g, b } = parseHex(c.hex);
    const { s } = toHSV(r, g, b);
    const sp = stats(c.name);
    const catBoost = NEW_CATEGORY_BOOST[c.name] ?? 0.5;

    // Base visual score
    let score = computeVisualScoreV2(c.percentage, sp.centerRatio, s, catBoost);

    // Area threshold penalty: < 8% cannot win unless centerArea > 15%
    if (c.percentage < 0.08 && sp.centerRatio < 0.15) {
      score = 0; // eliminated
    }

    // Background penalty: edge/top heavy → reduce score
    const bgPenalty = computeBackgroundPenalty(sp.edgeRatio, sp.topRatio);
    score *= bgPenalty;

    return { ...c, visualScore: score };
  });

  scored.sort((a, b) => b.visualScore - a.visualScore);
  const winner = scored[0];

  // ── Step D: Safety checks on the winner ──

  // If the top winner is White and it's tiny (< 8%), check if there's a chromatic
  // color with comparable score
  if (winner.name === "White" && winner.percentage < 0.08) {
    // Find the best chromatic candidate
    const bestChromatic = scored.find(
      (c) => !achromatic.has(c.name) && c.visualScore > 0
    );
    if (bestChromatic && bestChromatic.visualScore > winner.visualScore * 0.5) {
      return { hex: bestChromatic.hex, name: bestChromatic.name };
    }
  }

  // If winner is achromatic (Gray/Black) but there's a chromatic color with
  // score >= 70% of winner, prefer the chromatic (prevents gray landscapes
  // from being classified as Gray together with White when there's a strong pop of color)
  if (achromatic.has(winner.name) && winner.name !== "White") {
    const bestChromatic = scored.find(
      (c) => !achromatic.has(c.name) && c.visualScore > 0
    );
    if (
      bestChromatic &&
      bestChromatic.visualScore >= winner.visualScore * 0.7
    ) {
      return { hex: bestChromatic.hex, name: bestChromatic.name };
    }
  }

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
    } else {
      mergeMap.set(c.name, {
        hex: c.hex,
        percentage: c.percentage,
        centerWeight: c.centerWeight,
        count: c.count,
        centerCount: c.centerCount,
        edgeCount: c.edgeCount,
        topCount: c.topCount,
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
    }
  >();
  for (const [name, data] of mergeMap) {
    mergedClusters.push({ hex: data.hex, name, percentage: data.percentage });
    clusterSpatialStats.set(name, {
      centerWeight: data.centerWeight,
      centerRatio: data.count > 0 ? data.centerCount / data.count : 0.5,
      edgeRatio: data.count > 0 ? data.edgeCount / data.count : 0,
      topRatio: data.count > 0 ? data.topCount / data.count : 0,
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

  // ── Step 6: single-element color_tags ──
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