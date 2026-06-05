// ─── Minimum Viable Data Model ───────────────────────────────

export interface ImageData {
  id: string;
  name: string;
  src: string;
  dominantColor: string;
  category: string;
  createdAt: number;
}

export const STORAGE_KEY = "color-archive-images";