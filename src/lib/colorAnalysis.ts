// ─── Dominant Color Extraction ──────────────────────────────

function quantize(val: number, step = 32): number {
  return Math.round(val / step) * step;
}

function isBackground(r: number, g: number, b: number): boolean {
  return (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.round(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function downsampledImageData(
  src: string,
  maxPixels: number
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPixels / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas 2D context unavailable"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(ctx.getImageData(0, 0, w, h));
    };
    img.onerror = () => reject(new Error("Failed to load image for analysis"));
    img.src = src;
  });
}

/**
 * Extract the most dominant color from an image.
 */
export async function extractDominantColor(dataUrl: string): Promise<string> {
  const imageData = await downsampledImageData(dataUrl, 100);
  const pixels = imageData.data;

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 128) continue;
    if (isBackground(r, g, b)) continue;
    const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
    const existing = buckets.get(key);
    if (existing) existing.count++;
    else buckets.set(key, { r, g, b, count: 1 });
  }

  if (buckets.size === 0) return "#999999";

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);

  const merged: typeof sorted = [];
  for (const c of sorted) {
    let merged_ = false;
    for (const m of merged) {
      if (colorDistance(c.r, c.g, c.b, m.r, m.g, m.b) < 50) {
        m.count += c.count;
        merged_ = true;
        break;
      }
    }
    if (!merged_) merged.push({ ...c });
  }

  merged.sort((a, b) => b.count - a.count);
  return rgbToHex(merged[0].r, merged[0].g, merged[0].b);
}

/**
 * Extract a palette of up to N dominant colors from an image.
 * Returns sorted by frequency descending.
 */
export async function extractPalette(
  dataUrl: string,
  count: number = 5
): Promise<string[]> {
  const imageData = await downsampledImageData(dataUrl, 100);
  const pixels = imageData.data;

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 128) continue;
    if (isBackground(r, g, b)) continue;
    const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
    const existing = buckets.get(key);
    if (existing) existing.count++;
    else buckets.set(key, { r, g, b, count: 1 });
  }

  if (buckets.size === 0) return ["#999999"];

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);

  // Merge similar colors
  const merged: typeof sorted = [];
  for (const c of sorted) {
    let merged_ = false;
    for (const m of merged) {
      if (colorDistance(c.r, c.g, c.b, m.r, m.g, m.b) < 35) {
        m.count += c.count;
        merged_ = true;
        break;
      }
    }
    if (!merged_) merged.push({ ...c });
  }

  merged.sort((a, b) => b.count - a.count);
  return merged.slice(0, count).map((c) => rgbToHex(c.r, c.g, c.b));
}

// ─── Color Classification (18 categories) ──────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function toHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr:
        h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
        break;
      case gg:
        h = ((bb - rr) / d + 2) / 6;
        break;
      case bb:
        h = ((rr - gg) / d + 4) / 6;
        break;
    }
    h *= 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Classify a single hex color into one of 18 categories.
 */
function classifyHex(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = toHSL(r, g, b);

  if (l < 6) return "Black";
  if (l > 93 && s < 8) return "White";
  if (s < 8) return "Gray";

  if (l < 35 && s < 55 && h >= 10 && h <= 70) return "Brown";
  if (l < 30 && s < 60 && h >= 0 && h < 10) return "Brown";

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

  return "Gray";
}

/**
 * Classify an image by palette-weighted voting over all palette colors.
 *
 * Each palette color is classified individually, then the category
 * that appears most frequently wins.  If the palette is empty, falls
 * back to classifying `dominantHex`.
 */
export function classifyPalette(
  palette: string[],
  dominantHex: string
): string {
  if (palette.length === 0) return classifyHex(dominantHex);

  const votes = new Map<string, number>();
  for (const color of palette) {
    const cat = classifyHex(color);
    votes.set(cat, (votes.get(cat) || 0) + 1);
  }

  // Also include the dominant color with extra weight
  const domCat = classifyHex(dominantHex);
  votes.set(domCat, (votes.get(domCat) || 0) + 2);

  let best = "Gray";
  let bestCount = 0;
  for (const [cat, count] of votes) {
    if (count > bestCount || (count === bestCount && cat === domCat)) {
      best = cat;
      bestCount = count;
    }
  }

  return best;
}