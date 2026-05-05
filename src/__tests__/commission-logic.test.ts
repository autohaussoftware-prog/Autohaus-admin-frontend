import { describe, it, expect } from "vitest";
import { getVehicleProjectedProfit } from "@/lib/domain/vehicle-calculations";
import type { Vehicle } from "@/types/vehicle";

/**
 * Reglas de comisión en Autohaus:
 *   Captador  → 20% de la utilidad bruta
 *   Vendedor  → 20% de la utilidad bruta
 *   Crédito   → 33% del valor que ingresa (precio de venta acordado)
 *
 * Utilidad bruta = precio_venta - precio_compra - costos_reales
 */

function calcCaptador(profit: number, pct = 0.20) {
  return Math.round(profit * pct);
}

function calcVendedor(profit: number, pct = 0.20) {
  return Math.round(profit * pct);
}

function calcCredito(agreedPrice: number, pct = 0.33) {
  return Math.round(agreedPrice * pct);
}

function makeVehicle(buyPrice: number, targetPrice: number, realCost: number): Vehicle {
  return {
    id: "v1", plate: "ABC123", brand: "BMW", line: "X5", version: "",
    year: 2023, mileage: 0, color: "Negro", motor: "", transmission: "Automática",
    fuel: "Gasolina", traction: "", cityRegistration: "", legalStatus: "No",
    status: "Vendido", location: "Sede", ownerType: "Propio", entryType: "Compra",
    buyPrice, targetPrice, minPrice: targetPrice, estimatedCost: 0, realCost,
    advisorBuyer: "Ana Torres", soatDue: "", technoDue: "",
    published: false, separated: false, createdAt: "2025-01-01",
  };
}

// ── Comisión captador ─────────────────────────────────────────────────────

describe("Comisión captador (20% utilidad bruta)", () => {
  it("calcula comisión con utilidad simple", () => {
    const v = makeVehicle(30_000_000, 40_000_000, 2_000_000);
    const profit = getVehicleProjectedProfit(v); // 8_000_000
    expect(profit).toBe(8_000_000);
    expect(calcCaptador(profit)).toBe(1_600_000);
  });

  it("comisión es 0 en punto de equilibrio", () => {
    const v = makeVehicle(30_000_000, 32_000_000, 2_000_000);
    const profit = getVehicleProjectedProfit(v); // 0
    expect(calcCaptador(profit)).toBe(0);
  });

  it("comisión negativa en pérdida (no se paga pero es trazable)", () => {
    const v = makeVehicle(30_000_000, 28_000_000, 2_000_000);
    const profit = getVehicleProjectedProfit(v); // -4_000_000
    expect(profit).toBeLessThan(0);
    expect(calcCaptador(profit)).toBeLessThan(0);
  });

  it("utilidad alta genera comisión proporcional", () => {
    // 400M compra, 470M venta, 20M costos → utilidad 50M → comisión 10M
    const v = makeVehicle(400_000_000, 470_000_000, 20_000_000);
    const profit = getVehicleProjectedProfit(v);
    expect(profit).toBe(50_000_000);
    expect(calcCaptador(profit)).toBe(10_000_000);
  });
});

// ── Comisión vendedor ─────────────────────────────────────────────────────

describe("Comisión vendedor (20% utilidad bruta)", () => {
  it("misma base de cálculo que captador", () => {
    const v = makeVehicle(30_000_000, 40_000_000, 2_000_000);
    const profit = getVehicleProjectedProfit(v);
    expect(calcVendedor(profit)).toBe(calcCaptador(profit));
  });

  it("ambas comisiones juntas no superan el 40% de la utilidad", () => {
    const v = makeVehicle(30_000_000, 40_000_000, 2_000_000);
    const profit = getVehicleProjectedProfit(v); // 8M
    const total = calcCaptador(profit) + calcVendedor(profit); // 3.2M
    expect(total).toBeLessThanOrEqual(profit * 0.40 + 1); // margen por redondeo
  });

  it("con porcentaje configurado al 15%", () => {
    const v = makeVehicle(30_000_000, 40_000_000, 2_000_000);
    const profit = getVehicleProjectedProfit(v);
    expect(calcVendedor(profit, 0.15)).toBe(1_200_000);
  });
});

// ── Comisión crédito ──────────────────────────────────────────────────────

describe("Comisión crédito (33% del valor que ingresa)", () => {
  it("calcula 33% del precio acordado", () => {
    // Venta por crédito de 40M → comisión 13.2M
    expect(calcCredito(40_000_000)).toBe(13_200_000);
  });

  it("comisión crédito es sobre el valor completo, no la utilidad", () => {
    const agreedPrice = 36_000_000;
    const commision = calcCredito(agreedPrice);
    expect(commision).toBe(Math.round(36_000_000 * 0.33));
  });

  it("comisión crédito con porcentaje configurado al 30%", () => {
    expect(calcCredito(50_000_000, 0.30)).toBe(15_000_000);
  });
});

// ── Invariantes de negocio ────────────────────────────────────────────────

describe("Invariantes de negocio para comisiones", () => {
  it("la suma captador + vendedor es 40% de la utilidad (regla 20/20)", () => {
    const utilidades = [5_000_000, 10_000_000, 50_000_000, 100_000_000];
    for (const profit of utilidades) {
      const total = calcCaptador(profit) + calcVendedor(profit);
      expect(total).toBe(Math.round(profit * 0.40));
    }
  });

  it("una utilidad mayor genera comisiones mayores (monotonía)", () => {
    const profitBajo = 5_000_000;
    const profitAlto = 15_000_000;
    expect(calcCaptador(profitAlto)).toBeGreaterThan(calcCaptador(profitBajo));
    expect(calcVendedor(profitAlto)).toBeGreaterThan(calcVendedor(profitBajo));
  });

  it("trazabilidad: vehículo específico — comisiones cuadran con utilidad", () => {
    // BMW 530i: compra 180M, venta 210M, costos 8M → utilidad 22M
    const v = makeVehicle(180_000_000, 210_000_000, 8_000_000);
    const profit = getVehicleProjectedProfit(v);
    expect(profit).toBe(22_000_000);

    const captador = calcCaptador(profit);
    const vendedor = calcVendedor(profit);
    expect(captador).toBe(4_400_000);
    expect(vendedor).toBe(4_400_000);
    expect(captador + vendedor).toBe(8_800_000); // 40% de 22M

    // Utilidad neta después de comisiones
    const utilidadNeta = profit - captador - vendedor;
    expect(utilidadNeta).toBe(13_200_000);
    expect(utilidadNeta).toBeGreaterThan(0);
  });
});
