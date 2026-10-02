import type { Unit } from "./units";

export type PhotoPreset = {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: Unit;
  recommendedDpi?: number;
  description: string;
};

export const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: "passport-2x2in",
    name: "Passport Style — 2 × 2 in",
    width: 2, height: 2, unit: "in", recommendedDpi: 300,
    description: "A common square passport-style format.",
  },
  {
    id: "passport-35x45mm",
    name: "Passport Style — 35 × 45 mm",
    width: 35, height: 45, unit: "mm", recommendedDpi: 300,
    description: "A common passport-style format used in many countries outside the US.",
  },
  {
    id: "square",
    name: "Square Application Photo",
    width: 600, height: 600, unit: "px", recommendedDpi: 300,
    description: "A simple 1:1 square photo for applications that don't specify an exact size.",
  },
  {
    id: "portrait-3x4",
    name: "Portrait Application Photo — 3 × 4",
    width: 3, height: 4, unit: "in", recommendedDpi: 300,
    description: "A common portrait ratio used for ID and application photos.",
  },
  {
    id: "custom",
    name: "Custom",
    width: 35, height: 45, unit: "mm",
    description: "Enter your own exact width and height.",
  },
];

export const getPreset = (id: string) => PHOTO_PRESETS.find((p) => p.id === id) ?? PHOTO_PRESETS[0];

export type BackgroundSwatch = { id: string; label: string; color: string | null };
export const BACKGROUND_SWATCHES: BackgroundSwatch[] = [
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "blue", label: "Blue", color: "#3B5EDB" },
  { id: "light-blue", label: "Light blue", color: "#AFD4F2" },
  { id: "gray", label: "Gray", color: "#B9BEC7" },
  { id: "custom", label: "Custom", color: null },
];
