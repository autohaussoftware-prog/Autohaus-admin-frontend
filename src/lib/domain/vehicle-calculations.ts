import type { FinanceMovement } from "@/types/finance";
import type { Vehicle } from "@/types/vehicle";

export function getVehicleInvestedCapital(vehicle: Vehicle) {
  return vehicle.buyPrice + vehicle.realCost;
}

export function getVehicleProjectedProfit(vehicle: Vehicle) {
  return vehicle.targetPrice - vehicle.buyPrice - vehicle.realCost;
}

export function getVehicleProjectedMargin(vehicle: Vehicle) {
  if (!vehicle.targetPrice) return 0;
  return (getVehicleProjectedProfit(vehicle) / vehicle.targetPrice) * 100;
}

export function getFinanceBalance(movements: FinanceMovement[], channel?: FinanceMovement["channel"]) {
  return movements
    .filter((movement) => !channel || movement.channel === channel)
    .reduce((sum, movement) => sum + (movement.type === "Ingreso" ? movement.amount : -movement.amount), 0);
}

export function getVehicleRealCostFromFinance(vehicleId: string, movements: FinanceMovement[], costCategories: string[]) {
  return movements
    .filter((movement) => movement.vehicleId === vehicleId && movement.type === "Egreso" && costCategories.includes(movement.category))
    .reduce((sum, movement) => sum + movement.amount, 0);
}

