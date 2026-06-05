// ─── Dominant Color Extraction ──────────────────────────────
// Extracts the most significant non-background color from an image.
// Returns a HEX string like "#ff3366".

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

/**
 * Load and downsample an image from a data URL onto a canvas.
 * Returns the ImageData for pixel analysis.
 */
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
 * @param dataUrl - A data URL string (data:image/...)
 * @returns Promise resolving to a HEX color string (e.g. "#ff6633")
 */
export async function extractDominantColor(dataUrl: string): Promise<string> {
  console.log("[colorAnalysis] Starting dominant color extraction");

  const imageData = await downsampledImageData(dataUrl, 100);
  const pixels = imageData.data;

  // Bucket quantized colors
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
    if (existing) {
      existing.count++;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  if (buckets.size === 0) {
    console.log("[colorAnalysis] No non-background pixels found, returning fallback");
    return "#999999";
  }

  // Sort by popularity
  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);

  // Merge similar colors within distance 50
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
  const top = merged[0];
  const hex = rgbToHex(top.r, top.g, top.b);

  console.log(`[colorAnalysis] Dominant color: ${hex} (${top.count} samples)`);
  return hex;
}

// ─── Color Classification ────────────────────────────────────
// Maps a HEX color string to one of 10 category names.

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Classify a hex color into one of 10 categories:
 * Red, Orange, Yellow, Green, Cyan, Blue, Purple, Pink, Brown, Gray
 */
export function classifyHex(hex: string): string {
  const { r, g, b } = hexToRgb(hex);

  // Reuse HSL from local scope
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

  const sat = s * 100;
  const light = l * 100;

  // Grayscale
  if (sat < 10) return "Gray";

  // Brown: low-light, low-sat, orange hue
  if (light < 40 && sat < 50 && h >= 15 && h <= 70) return "Brown";

  // Hue-based
  if (h >= 345 || h < 15) return "Red";
  if (h >= 15 && h < 45) return "Orange";
  if (h >= 45 && h < 70) return "Yellow";
  if (h >= 70 && h < 170) return "Green";
  if (h >= 170 && h < 200) return "Cyan";
  if (h >= 200 && h < 250) return "Blue";
  if (h >= 250 && h < 290) return "Purple";
  if (h >= 290 && h < 345) return "Pink";

  return "Gray";
}