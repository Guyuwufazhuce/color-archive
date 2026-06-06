// ─── Shared 18 Color Categories ──────────────────────────────
// Used by GalleryClient filter bar and HomeClient ColorStats.

export const CATEGORIES = [
  { name: "Red", hex: "#FF3B30" },
  { name: "Orange", hex: "#FF9500" },
  { name: "Amber", hex: "#FFB340" },
  { name: "Yellow", hex: "#FFD60A" },
  { name: "Lime", hex: "#A3E635" },
  { name: "Green", hex: "#34C759" },
  { name: "Mint", hex: "#5EEAD4" },
  { name: "Cyan", hex: "#00C7BE" },
  { name: "Sky", hex: "#38BDF8" },
  { name: "Blue", hex: "#007AFF" },
  { name: "Indigo", hex: "#5856D6" },
  { name: "Purple", hex: "#AF52DE" },
  { name: "Pink", hex: "#FF2D55" },
  { name: "Rose", hex: "#FB7185" },
  { name: "Brown", hex: "#8B572A" },
  { name: "Gray", hex: "#8E8E93" },
  { name: "Black", hex: "#1C1C1E" },
  { name: "White", hex: "#F2F2F7" },
] as const;

export type ColorCategory = (typeof CATEGORIES)[number];