import type { ColorCategory, DominantColor } from "./types";

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  return Math.sqrt(
    (r1 - r2) * (r1 - r2) +
      (g1 - g2) * (g1 - g2) +
      (b1 - b2) * (b1 - b2)
  );
}

function isBackgroundColor(r: number, g: number, b: number): boolean {
  // Near white
  if (r > 240 && g > 240 && b > 240) return true;
  // Near black
  if (r < 15 && g < 15 && b < 15) return true;
  return false;
}

function quantizeColor(r: number, g: number, b: number): string {
  // Quantize to reduce noise: group similar colors
  const step = 32;
  const qr = Math.round(r / step) * step;
  const qg = Math.round(g / step) * step;
  const qb = Math.round(b / step) * step;
  return `${qr},${qg},${qb}`;
}

export function classifyColor(
  r: number,
  g: number,
  b: number
): ColorCategory {
  const { h, s, l } = rgbToHsl(r, g, b);

  // Grayscale: very low saturation
  if (s < 10) {
    return "grayscale";
  }

  // Brown: low lightness, low-mid saturation, orange-yellow hue
  if (l < 40 && s < 50 && h >= 15 && h <= 70) {
    return "brown";
  }

  // Hue-based classification
  if (h >= 345 || h < 15) return "red";
  if (h >= 15 && h < 45) return "orange";
  if (h >= 45 && h < 70) return "yellow";
  if (h >= 70 && h < 170) return "green";
  if (h >= 170 && h < 200) return "cyan";
  if (h >= 200 && h < 250) return "blue";
  if (h >= 250 && h < 290) return "purple";
  if (h >= 290 && h < 345) return "pink";

  return "uncategorized";
}

export async function extractDominantColors(
  dataUrl: string,
  maxWidth: number = 100
): Promise<DominantColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate scaled dimensions
      const scale = Math.min(1, maxWidth / img.width);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Collect non-background, non-transparent pixels
      const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;
        // Skip background-like pixels
        if (isBackgroundColor(r, g, b)) continue;

        const key = quantizeColor(r, g, b);
        const existing = colorBuckets.get(key);
        if (existing) {
          existing.count++;
        } else {
          colorBuckets.set(key, { r, g, b, count: 1 });
        }
      }

      if (colorBuckets.size === 0) {
        resolve([]);
        return;
      }

      // Sort by frequency
      const sorted = Array.from(colorBuckets.values()).sort(
        (a, b) => b.count - a.count
      );

      const totalPixels = sorted.reduce((sum, c) => sum + c.count, 0);

      // Merge similar colors
      const merged: typeof sorted = [];
      for (const color of sorted) {
        let merged_ = false;
        for (const m of merged) {
          if (
            colorDistance(color.r, color.g, color.b, m.r, m.g, m.b) < 50
          ) {
            m.count += color.count;
            merged_ = true;
            break;
          }
        }
        if (!merged_) {
          merged.push({ ...color });
        }
      }

      // Re-sort after merge
      merged.sort((a, b) => b.count - a.count);

      // Take top 5
      const top = merged.slice(0, 5);

      const dominantColors: DominantColor[] = top.map((c) => {
        const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
        return {
          hex: rgbToHex(c.r, c.g, c.b),
          r: c.r,
          g: c.g,
          b: c.b,
          h,
          s,
          l,
          percentage: Math.round((c.count / totalPixels) * 1000) / 10,
        };
      });

      resolve(dominantColors);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export function determineCategory(colors: DominantColor[]): ColorCategory {
  if (colors.length === 0) return "uncategorized";

  // Use the most dominant non-background color
  const primary = colors[0];
  return classifyColor(primary.r, primary.g, primary.b);
}
