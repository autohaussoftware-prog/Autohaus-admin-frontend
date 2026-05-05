import { describe, it, expect } from "vitest";
import { vehicleSchema } from "@/lib/schemas/vehicle-schema";
import { getVehicleProjectedProfit, getVehicleProjectedMargin, getVehicleInvestedCapital } from "@/lib/domain/vehicle-calculations";
import type { Vehicle } from "@/types/vehicle";

/**
 * Tests de trazabilidad: verifican que los datos ingresados en el formulario
 * se parsean correctamente y producen los cálculos esperados en el dominio.
 *
 * Simula el flujo completo: FormData → Schema → Dominio → Cálculo.
 */

// ── Helpers ───────────────────────────────────────────────────────────────

function parseForm(data: Record<string, string>) {
  return vehicleSchema.safeParse(data);
}

function schemaToVehicle(parsed: ReturnType<typeof vehicleSchema.safeParse>): Vehicle | null {
  if (!parsed.success) return null;
  const d = parsed.data;
  return {
    id: "test",
    plate: d.plate,
    brand: d.brand,
    line: d.line,
    version: d.version ?? "",
    year: d.year ?? 0,
    mileage: d.mileage ?? 0,
    color: d.color,
    motor: d.motor ?? "",
    transmission: d.transmission,
    fuel: d.fuel,
    traction: d.traction ?? "",
    cityRegistration: d.cityRegistration ?? "",
    legalStatus: d.legalStatus,
    lienValue: d.lienValue,
    status: d.status,
    location: "",
    ownerType: d.ownerType,
    entryType: d.entryType ?? "Compra",
    buyPrice: d.buyPrice ?? 0,
    targetPrice: d.targetPrice ?? 0,
    minPrice: d.minPrice ?? 0,
    estimatedCost: d.estimatedCost ?? 0,
    realCost: d.realCost ?? 0,
    advisorBuyer: "",
    soatDue: d.soatDue ?? "",
    technoDue: d.technoDue ?? "",
    published: false,
    separated: false,
    createdAt: new Date().toISOString(),
  };
}

// ── Trazabilidad FormData → Cálculos ─────────────────────────────────────

describe("Trazabilidad: FormData → Schema → Cálculos de rentabilidad", () => {
  it("datos del formulario producen el capital invertido correcto", () => {
    const form = {
      plate: "BMW001", brand: "BMW", line: "530i", year: "2023",
      color: "Negro zafiro", transmission: "Automática", fuel: "Gasolina",
      legalStatus: "No", status: "Disponible", ownerType: "Propio",
      buyPrice: "180000000", realCost: "8000000",
    };
    const parsed = parseForm(form);
    expect(parsed.success).toBe(true);
    const vehicle = schemaToVehicle(parsed);
    expect(vehicle).not.toBeNull();
    expect(getVehicleInvestedCapital(vehicle!)).toBe(188_000_000);
  });

  it("datos del formulario producen la utilidad proyectada correcta", () => {
    const form = {
      plate: "BMW001", brand: "BMW", line: "530i", year: "2023",
      color: "Negro", transmission: "Automática", fuel: "Gasolina",
      legalStatus: "No", status: "Disponible", ownerType: "Propio",
      buyPrice: "180000000", targetPrice: "210000000", realCost: "8000000",
    };
    const parsed = parseForm(form);
    const vehicle = schemaToVehicle(parsed);
    expect(getVehicleProjectedProfit(vehicle!)).toBe(22_000_000);
  });

  it("datos del formulario producen el margen proyectado correcto", () => {
    const form = {
      plate: "MAZ001", brand: "Mazda", line: "CX-5", year: "2022",
      color: "Gris", transmission: "Automática", fuel: "Gasolina",
      legalStatus: "No", status: "Disponible", ownerType: "Propio",
      buyPrice: "60000000", targetPrice: "70000000", realCost: "3000000",
    };
    const parsed = parseForm(form);
    const vehicle = schemaToVehicle(parsed);
    // (70M - 60M - 3M) / 70M * 100 ≈ 10%
    expect(getVehicleProjectedMargin(vehicle!)).toBeCloseTo(10, 1);
  });

  it("vehículo con margen bajo el 3% — trazable como situación de riesgo", () => {
    const form = {
      plate: "RNG001", brand: "Renault", line: "Sandero", year: "2021",
      color: "Blanco", transmission: "Manual", fuel: "Gasolina",
      legalStatus: "No", status: "Disponible", ownerType: "Propio",
      buyPrice: "29000000", targetPrice: "30000000", realCost: "500000",
    };
    const parsed = parseForm(form);
    expect(parsed.success).toBe(true);
    const vehicle = schemaToVehicle(parsed);
    const margin = getVehicleProjectedMargin(vehicle!);
    // (30M - 29M - 0.5M) / 30M * 100 ≈ 1.67% — por debajo del mínimo de 3%
    expect(margin).toBeGreaterThan(0);
    expect(margin).toBeLessThan(3);
  });
});

// ── Trazabilidad: consistencia de precios ─────────────────────────────────

describe("Trazabilidad: consistencia de datos de precio en el schema", () => {
  const BASE = {
    plate: "TOY001", brand: "Toyota", line: "Land Cruiser", year: "2024",
    color: "Blanco", transmission: "Automática", fuel: "Diésel",
    legalStatus: "No", status: "Disponible", ownerType: "Propio",
  };

  it("precio de compra se preserva exactamente al parsear", () => {
    const result = parseForm({ ...BASE, buyPrice: "350000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.buyPrice).toBe(350_000_000);
  });

  it("precio de publicación se preserva exactamente al parsear", () => {
    const result = parseForm({ ...BASE, targetPrice: "420000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.targetPrice).toBe(420_000_000);
  });

  it("precio mínimo se preserva exactamente al parsear", () => {
    const result = parseForm({ ...BASE, minPrice: "390000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.minPrice).toBe(390_000_000);
  });

  it("no hay pérdida de precisión en precios de 9 dígitos (hasta 999M)", () => {
    const bigPrice = "999000000";
    const result = parseForm({ ...BASE, buyPrice: bigPrice });
    if (result.success) expect(result.data.buyPrice).toBe(999_000_000);
  });

  it("campo buyPrice string vacío resulta en undefined (no en 0)", () => {
    const result = parseForm({ ...BASE, buyPrice: "" });
    if (result.success) expect(result.data.buyPrice).toBeUndefined();
  });
});

// ── Trazabilidad: datos de consignación ──────────────────────────────────

describe("Trazabilidad: consignación — datos del propietario", () => {
  const BASE_COMISION = {
    plate: "CNS001", brand: "Honda", line: "CR-V", year: "2021",
    color: "Azul", transmission: "Automática", fuel: "Gasolina",
    legalStatus: "No", status: "Disponible", ownerType: "Comisión",
  };

  it("nombre del propietario se preserva tal como se ingresó", () => {
    const result = parseForm({ ...BASE_COMISION, ownerName: "María López Restrepo", ownerPhone: "3101234567", targetPrice: "50000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.ownerName).toBe("María López Restrepo");
  });

  it("teléfono del propietario se preserva tal como se ingresó", () => {
    const result = parseForm({ ...BASE_COMISION, ownerName: "Pedro Soto", ownerPhone: "+57 310 5551234", targetPrice: "45000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.ownerPhone).toBe("+57 310 5551234");
  });

  it("ownerName con espacios al inicio/final se limpia (trim)", () => {
    const result = parseForm({ ...BASE_COMISION, ownerName: "  Carlos García  ", ownerPhone: "3001234567", targetPrice: "55000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.ownerName).toBe("Carlos García");
  });
});

// ── Trazabilidad: campos de prenda ───────────────────────────────────────

describe("Trazabilidad: prenda/gravamen", () => {
  const BASE = {
    plate: "PRN001", brand: "Audi", line: "A6", year: "2022",
    color: "Gris nardo", transmission: "Automática", fuel: "Gasolina",
    status: "Disponible", ownerType: "Propio",
  };

  it("prenda=No se preserva correctamente", () => {
    const result = parseForm({ ...BASE, legalStatus: "No" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.legalStatus).toBe("No");
  });

  it("prenda=Sí con valor se preservan correctamente", () => {
    const result = parseForm({ ...BASE, legalStatus: "Sí", lienValue: "75000000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.legalStatus).toBe("Sí");
      expect(result.data.lienValue).toBe(75_000_000);
    }
  });

  it("prenda=Sí sin valor de prenda es válido (valor opcional)", () => {
    const result = parseForm({ ...BASE, legalStatus: "Sí", lienValue: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.legalStatus).toBe("Sí");
      expect(result.data.lienValue).toBeUndefined();
    }
  });
});

// ── Trazabilidad: placa en mayúsculas ────────────────────────────────────

describe("Trazabilidad: normalización de placa", () => {
  const BASE = {
    brand: "Kia", line: "Sportage", year: "2023",
    color: "Negro", transmission: "Automática", fuel: "Gasolina",
    legalStatus: "No", status: "Disponible", ownerType: "Propio",
  };

  it("placa llega tal como se envía (la normalización a mayúsculas es en la UI y en createVehicle)", () => {
    // El schema solo valida longitud, no hace uppercase
    const result = parseForm({ ...BASE, plate: "abc123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.plate).toBe("abc123");
  });

  it("placa con espacios al inicio/final se limpia (trim)", () => {
    const result = parseForm({ ...BASE, plate: "  KMQ918  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.plate).toBe("KMQ918");
  });
});
