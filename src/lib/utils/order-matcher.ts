import type { Vehicle } from "@/types/vehicle";

export const BUDGET_RANGES: Record<string, [number, number]> = {
  "Hasta $30M":      [0,           30_000_000],
  "$30M – $60M":     [30_000_000,  60_000_000],
  "$60M – $100M":    [60_000_000,  100_000_000],
  "$100M – $150M":   [100_000_000, 150_000_000],
  "$150M – $250M":   [150_000_000, 250_000_000],
  "Más de $250M":    [250_000_000, Number.MAX_SAFE_INTEGER],
};

const AVAILABLE_STATUSES = ["Disponible", "Publicado", "No publicado"];

export type OrderLike = {
  brand: string;
  line: string;
  year: number;
  budget: string;
  colorPreference?: string;
};

export function matchesOrder(vehicle: Vehicle, order: OrderLike): boolean {
  if (!AVAILABLE_STATUSES.includes(vehicle.status)) return false;

  if (vehicle.brand.toLowerCase().trim() !== order.brand.toLowerCase().trim()) return false;

  const vLine = vehicle.line.toLowerCase().trim();
  const oLine = order.line.toLowerCase().trim();
  if (!vLine.includes(oLine) && !oLine.includes(vLine)) return false;

  if (Math.abs(vehicle.year - order.year) > 2) return false;

  const [min, max] = BUDGET_RANGES[order.budget] ?? [0, Number.MAX_SAFE_INTEGER];
  const price = vehicle.targetPrice;
  if (price > 0 && (price < min || price > max)) return false;

  return true;
}

export function getMatchingVehicles(vehicles: Vehicle[], order: OrderLike): Vehicle[] {
  return vehicles.filter((v) => matchesOrder(v, order));
}
