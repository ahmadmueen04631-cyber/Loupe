export type Unit = "px" | "mm" | "in";

export function toPixels(value: number, unit: Unit, dpi: number): number {
  if (unit === "px") return Math.round(value);
  if (unit === "in") return Math.round(value * dpi);
  return Math.round((value / 25.4) * dpi); // mm
}

export function formatUnitValue(value: number, unit: Unit): string {
  if (unit === "px") return `${Math.round(value)} px`;
  return `${value} ${unit}`;
}
