import { describe, it, expect } from "vitest";
import {
  getVehicleInvestedCapital,
  getVehicleProjectedProfit,
  getVehicleProjectedMargin,
  getFinanceBalance,
  getVehicleRealCostFromFinance,
} from "@/lib/domain/vehicle-calculations";
import type { Vehicle } from "@/types/vehicle";
import type { FinanceMovement } from "@/types/finance";

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "v1",
    plate: "KMQ918",
    brand: "Toyota",
    line: "Hilux",
    version: "",
    year: 2022,
    mileage: 0,
    color: "Blanco",
    motor: "",
    transmission: "Manual",
    fuel: "Diésel",
    traction: "",
    cityRegistration: "",
    legalStatus: "No",
    status: "Disponible",
    location: "Sede principal",
    ownerType: "Propio",
    entryType: "Compra",
    buyPrice: 0,
    targetPrice: 0,
    minPrice: 0,
    estimatedCost: 0,
    realCost: 0,
    advisorBuyer: "Sin asignar",
    soatDue: "",
    technoDue: "",
    published: false,
    separated: false,
    createdAt: "2025-01-01",
    ...overrides,
  };
}

// ── Capital invertido ─────────────────────────────────────────────────────

describe("getVehicleInvestedCapital", () => {
  it("suma buyPrice + realCost correctamente", () => {
    const v = makeVehicle({ buyPrice: 30_000_000, realCost: 2_500_000 });
    expect(getVehicleInvestedCapital(v)).toBe(32_500_000);
  });

  it("retorna buyPrice cuando realCost es 0", () => {
    const v = makeVehicle({ buyPrice: 50_000_000, realCost: 0 });
    expect(getVehicleInvestedCapital(v)).toBe(50_000_000);
  });

  it("retorna 0 cuando ambos son 0", () => {
    const v = makeVehicle({ buyPrice: 0, realCost: 0 });
    expect(getVehicleInvestedCapital(v)).toBe(0);
  });

  it("suma correctamente con costos altos", () => {
    const v = makeVehicle({ buyPrice: 380_000_000, realCost: 15_000_000 });
    expect(getVehicleInvestedCapital(v)).toBe(395_000_000);
  });
});

// ── Utilidad proyectada ───────────────────────────────────────────────────

describe("getVehicleProjectedProfit", () => {
  it("calcula utilidad positiva correctamente", () => {
    const v = makeVehicle({ targetPrice: 40_000_000, buyPrice: 30_000_000, realCost: 2_000_000 });
    expect(getVehicleProjectedProfit(v)).toBe(8_000_000);
  });

  it("retorna utilidad negativa cuando hay pérdida (targetPrice < costo total)", () => {
    const v = makeVehicle({ targetPrice: 28_000_000, buyPrice: 30_000_000, realCost: 2_000_000 });
    expect(getVehicleProjectedProfit(v)).toBe(-4_000_000);
  });

  it("retorna 0 cuando targetPrice = buyPrice + realCost (punto de equilibrio)", () => {
    const v = makeVehicle({ targetPrice: 32_000_000, buyPrice: 30_000_000, realCost: 2_000_000 });
    expect(getVehicleProjectedProfit(v)).toBe(0);
  });

  it("maneja vehículo sin costos aún registrados", () => {
    const v = makeVehicle({ targetPrice: 36_000_000, buyPrice: 30_000_000, realCost: 0 });
    expect(getVehicleProjectedProfit(v)).toBe(6_000_000);
  });
});

// ── Margen proyectado ─────────────────────────────────────────────────────

describe("getVehicleProjectedMargin", () => {
  it("calcula margen correctamente sobre targetPrice", () => {
    // (40M - 30M - 2M) / 40M * 100 = 20%
    const v = makeVehicle({ targetPrice: 40_000_000, buyPrice: 30_000_000, realCost: 2_000_000 });
    expect(getVehicleProjectedMargin(v)).toBeCloseTo(20, 4);
  });

  it("retorna 0 cuando targetPrice es 0 (evita división por cero)", () => {
    const v = makeVehicle({ targetPrice: 0, buyPrice: 30_000_000, realCost: 0 });
    expect(getVehicleProjectedMargin(v)).toBe(0);
  });

  it("retorna margen negativo cuando hay pérdida", () => {
    const v = makeVehicle({ targetPrice: 28_000_000, buyPrice: 30_000_000, realCost: 2_000_000 });
    expect(getVehicleProjectedMargin(v)).toBeLessThan(0);
  });

  it("margen del 3% (mínimo operativo) se calcula correctamente", () => {
    // margen = 3% → profit = targetPrice * 0.03
    // targetPrice = 36_082_474, buyPrice = 33_000_000, realCost = 2_000_000
    const targetPrice = 36_082_474;
    const buyPrice = 33_000_000;
    const realCost = 2_000_000;
    const v = makeVehicle({ targetPrice, buyPrice, realCost });
    const margin = getVehicleProjectedMargin(v);
    expect(margin).toBeCloseTo(3, 0); // ~3%
  });

  it("margen del 100% cuando buyPrice y realCost son 0 (vehículo sin costo)", () => {
    const v = makeVehicle({ targetPrice: 10_000_000, buyPrice: 0, realCost: 0 });
    expect(getVehicleProjectedMargin(v)).toBeCloseTo(100, 4);
  });
});

// ── Balance financiero ────────────────────────────────────────────────────

function makeMovement(overrides: Partial<FinanceMovement>): FinanceMovement {
  return {
    id: String(Math.random()),
    date: "2025-01-01",
    type: "Ingreso",
    channel: "Banco",
    category: "Venta vehículo",
    concept: "",
    amount: 0,
    responsible: "",
    ...overrides,
  };
}

describe("getFinanceBalance", () => {
  it("suma ingresos y resta egresos correctamente", () => {
    const movements = [
      makeMovement({ type: "Ingreso", amount: 10_000_000 }),
      makeMovement({ type: "Ingreso", amount: 5_000_000 }),
      makeMovement({ type: "Egreso", amount: 3_000_000 }),
    ];
    expect(getFinanceBalance(movements)).toBe(12_000_000);
  });

  it("retorna 0 con lista vacía", () => {
    expect(getFinanceBalance([])).toBe(0);
  });

  it("retorna negativo cuando egresos superan ingresos", () => {
    const movements = [
      makeMovement({ type: "Ingreso", amount: 1_000_000 }),
      makeMovement({ type: "Egreso", amount: 5_000_000 }),
    ];
    expect(getFinanceBalance(movements)).toBe(-4_000_000);
  });

  it("filtra por canal Banco correctamente", () => {
    const movements = [
      makeMovement({ type: "Ingreso", channel: "Banco", amount: 10_000_000 }),
      makeMovement({ type: "Ingreso", channel: "Efectivo José", amount: 5_000_000 }),
      makeMovement({ type: "Egreso", channel: "Banco", amount: 2_000_000 }),
    ];
    expect(getFinanceBalance(movements, "Banco")).toBe(8_000_000);
  });

  it("filtra por canal Efectivo José correctamente", () => {
    const movements = [
      makeMovement({ type: "Ingreso", channel: "Banco", amount: 10_000_000 }),
      makeMovement({ type: "Ingreso", channel: "Efectivo José", amount: 3_000_000 }),
      makeMovement({ type: "Egreso", channel: "Efectivo José", amount: 1_000_000 }),
    ];
    expect(getFinanceBalance(movements, "Efectivo José")).toBe(2_000_000);
  });

  it("retorna 0 cuando no hay movimientos del canal solicitado", () => {
    const movements = [
      makeMovement({ type: "Ingreso", channel: "Banco", amount: 10_000_000 }),
    ];
    expect(getFinanceBalance(movements, "Efectivo Tomás")).toBe(0);
  });

  it("solo ingresos resultan en balance positivo igual a la suma", () => {
    const movements = [
      makeMovement({ type: "Ingreso", amount: 7_000_000 }),
      makeMovement({ type: "Ingreso", amount: 3_000_000 }),
    ];
    expect(getFinanceBalance(movements)).toBe(10_000_000);
  });
});

// ── Costo real desde movimientos financieros ──────────────────────────────

describe("getVehicleRealCostFromFinance", () => {
  const COST_CATEGORIES = ["Mecánica", "Pintura", "Lavado", "Trámites"];
  const vehicleId = "v-abc-123";

  it("suma solo egresos del vehículo en categorías de costo", () => {
    const movements = [
      makeMovement({ type: "Egreso", vehicleId, category: "Mecánica", amount: 800_000 }),
      makeMovement({ type: "Egreso", vehicleId, category: "Pintura", amount: 1_200_000 }),
      makeMovement({ type: "Ingreso", vehicleId, category: "Mecánica", amount: 500_000 }), // no cuenta
    ];
    expect(getVehicleRealCostFromFinance(vehicleId, movements, COST_CATEGORIES)).toBe(2_000_000);
  });

  it("ignora movimientos de otro vehículo", () => {
    const movements = [
      makeMovement({ type: "Egreso", vehicleId, category: "Lavado", amount: 200_000 }),
      makeMovement({ type: "Egreso", vehicleId: "otro-vehiculo", category: "Lavado", amount: 999_000 }),
    ];
    expect(getVehicleRealCostFromFinance(vehicleId, movements, COST_CATEGORIES)).toBe(200_000);
  });

  it("ignora categorías que no son de costo del vehículo", () => {
    const movements = [
      makeMovement({ type: "Egreso", vehicleId, category: "Mecánica", amount: 500_000 }),
      makeMovement({ type: "Egreso", vehicleId, category: "Nómina", amount: 3_000_000 }), // no es costo vehículo
    ];
    expect(getVehicleRealCostFromFinance(vehicleId, movements, COST_CATEGORIES)).toBe(500_000);
  });

  it("retorna 0 si no hay movimientos para el vehículo", () => {
    expect(getVehicleRealCostFromFinance(vehicleId, [], COST_CATEGORIES)).toBe(0);
  });

  it("suma todos los costos en múltiples categorías", () => {
    const movements = [
      makeMovement({ type: "Egreso", vehicleId, category: "Mecánica", amount: 1_500_000 }),
      makeMovement({ type: "Egreso", vehicleId, category: "Pintura", amount: 2_000_000 }),
      makeMovement({ type: "Egreso", vehicleId, category: "Lavado", amount: 150_000 }),
      makeMovement({ type: "Egreso", vehicleId, category: "Trámites", amount: 350_000 }),
    ];
    expect(getVehicleRealCostFromFinance(vehicleId, movements, COST_CATEGORIES)).toBe(4_000_000);
  });
});
