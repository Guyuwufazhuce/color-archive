export type ColorFamily =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "pink"
  | "brown"
  | "grayscale"
  | "uncategorized";

export interface PhotoRecord {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  dominant_hex: string;
  color_family: ColorFamily;
  width: number;
  height: number;
  created_at: string;
}