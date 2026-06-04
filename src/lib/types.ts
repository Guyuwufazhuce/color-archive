export type ColorCategory =
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

export interface DominantColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  percentage: number;
}

export interface ImageData {
  id: string;
  name: string;
  dataUrl: string;
  dominantColors: DominantColor[];
  category: ColorCategory;
  manualCategory: ColorCategory | null;
}

export const CATEGORY_LABELS: Record<ColorCategory, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  cyan: "Cyan",
  blue: "Blue",
  purple: "Purple",
  pink: "Pink",
  brown: "Brown",
  grayscale: "Grayscale",
  uncategorized: "Uncategorized",
};

export const CATEGORY_COLORS: Record<ColorCategory, string> = {
  red: "#e74c3c",
  orange: "#e67e22",
  yellow: "#f1c40f",
  green: "#2ecc71",
  cyan: "#1abc9c",
  blue: "#3498db",
  purple: "#9b59b6",
  pink: "#e84393",
  brown: "#8b5e3c",
  grayscale: "#7f8c8d",
  uncategorized: "#bdc3c7",
};

export const CATEGORY_ORDER: ColorCategory[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
  "brown",
  "grayscale",
  "uncategorized",
];
