// ─── Unified Data Model ──────────────────────────────────────
// Canonical fields: id, name, image_url, storage_path, color_hex,
//                    color_name, palette, created_at

export interface ImageData {
  id: string;
  name: string;
  image_url: string;
  storage_path: string | null;
  color_hex: string;
  color_name: string;
  palette: string[];
  created_at: number;
}

export const STORAGE_KEY = "color-archive-images";

// ─── Normalize legacy / malformed records ─────────────────

function normalizeOne(raw: Record<string, unknown>): ImageData {
  const id = String(raw.id ?? raw.Id ?? crypto.randomUUID());
  const name = String(raw.name ?? raw.Name ?? "untitled");

  const image_url = String(
    raw.image_url ?? raw.src ?? raw.ImageUrl ?? (raw as any).image_url ?? ""
  );

  let palette: string[] = [];
  if (Array.isArray(raw.palette)) palette = raw.palette;
  else if (Array.isArray(raw.Palette)) palette = raw.Palette;

  return {
    id,
    name,
    image_url,
    storage_path: raw.storage_path ? String(raw.storage_path) : null,
    color_hex: String(raw.color_hex ?? raw.dominantColor ?? raw.DominantColor ?? "#999999"),
    color_name: String(raw.color_name ?? raw.category ?? raw.Category ?? "Gray"),
    palette,
    created_at: Number(raw.created_at ?? raw.createdAt ?? raw.CreatedAt ?? Date.now()),
  };
}

export function loadImages(): ImageData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeOne) : [];
  } catch {
    return [];
  }
}

export function saveImages(images: ImageData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}