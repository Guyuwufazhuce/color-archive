// ─── Color Cluster (shared type) ───────────────────────────

/** A single extracted color cluster with hex, category name, and percentage. */
export interface ColorCluster {
  hex: string;
  name: string;
  percentage: number;
}

// ─── PhotoRecord – matches Supabase `photos` table ─────────

export interface PhotoRecord {
  id: string;
  filename: string;
  image_url: string;
  storage_path: string;
  dominant_color: string;
  dominant_colors: ColorCluster[];
  color_tags: string[];
  created_at: string; // ISO timestamp from Supabase
}

// ─── ImageData – client-side view model ────────────────────

export interface ImageData {
  id: string;
  name: string;
  image_url: string;
  storage_path: string | null;
  color_hex: string;
  color_name: string;
  palette: string[];
  dominant_colors: ColorCluster[];
  color_tags: string[];
  created_at: number; // unix ms
}