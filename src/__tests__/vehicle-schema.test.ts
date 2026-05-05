import { describe, it, expect } from "vitest";
import { vehicleSchema } from "@/lib/schemas/vehicle-schema";

// Datos base válidos para vehículo propio
const BASE_PROPIO = {
  plate: "KMQ918",
  brand: "Toyota",
  line: "Hilux",
  year: "2022",
  color: "Blanco",
  transmission: "Manual",
  fuel: "Diésel",
  legalStatus: "No",
  status: "Disponible",
  ownerType: "Propio",
};

// Datos base válidos para consignación
const BASE_COMISION = {
  plate: "XYZ123",
  brand: "Mazda",
  line: "CX-5",
  year: "2023",
  color: "Gris",
  transmission: "Automática",
  fuel: "Gasolina",
  legalStatus: "No",
  status: "Disponible",
  ownerType: "Comisión",
  ownerName: "Carlos Pérez",
  ownerPhone: "3001234567",
  targetPrice: "65000000",
};

// ── Campos obligatorios básicos ─────────────────────────────────────────────

describe("Campos obligatorios", () => {
  it("acepta un vehículo propio mínimo válido", () => {
    const result = vehicleSchema.safeParse(BASE_PROPIO);
    expect(result.success).toBe(true);
  });

  it("rechaza placa de menos de 3 caracteres", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, plate: "AB" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("plate");
  });

  it("rechaza marca vacía", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, brand: "T" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("brand");
  });

  it("rechaza línea vacía", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, line: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("line");
  });

  it("rechaza año 0", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, year: "0" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("year");
  });

  it("rechaza color vacío", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, color: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("color");
  });

  it("rechaza transmisión inválida", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, transmission: "CVT" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("transmission");
  });

  it("acepta transmisión Manual", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, transmission: "Manual" });
    expect(result.success).toBe(true);
  });

  it("acepta transmisión Automática", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, transmission: "Automática" });
    expect(result.success).toBe(true);
  });

  it("rechaza combustible vacío", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, fuel: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("fuel");
  });

  it("rechaza legalStatus inválido", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, legalStatus: "Quizás" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("legalStatus");
  });
});

// ── Reglas de precio para vehículos propios ─────────────────────────────────

describe("Validaciones de precio — vehículo Propio", () => {
  it("rechaza precio de compra igual a $0", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, buyPrice: "0" });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("buyPrice");
  });

  it("acepta precio de compra mayor a cero", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, buyPrice: "30000000" });
    expect(result.success).toBe(true);
  });

  it("acepta buyPrice omitido (asesor no lo envía)", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO });
    expect(result.success).toBe(true);
  });

  it("rechaza precio mínimo menor al precio de compra", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      minPrice: "25000000", // < compra
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("minPrice");
  });

  it("acepta precio mínimo igual al precio de compra", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      minPrice: "30000000",
    });
    expect(result.success).toBe(true);
  });

  it("acepta precio mínimo mayor al precio de compra", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      minPrice: "33000000",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza precio de publicación menor al precio de compra", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      targetPrice: "28000000", // < compra
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("targetPrice");
  });

  it("acepta precio de publicación mayor al precio de compra", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      targetPrice: "36000000",
    });
    expect(result.success).toBe(true);
  });

  it("no activa validaciones de precio si minPrice está vacío", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      minPrice: "",
    });
    expect(result.success).toBe(true);
  });

  it("detecta ambas violaciones de precio en el mismo parse", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      minPrice: "20000000",    // < compra
      targetPrice: "25000000", // < compra
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("minPrice");
    expect(paths).toContain("targetPrice");
  });
});

// ── Reglas de consignación ──────────────────────────────────────────────────

describe("Validaciones de consignación (ownerType = Comisión)", () => {
  it("acepta consignación con todos los campos requeridos", () => {
    const result = vehicleSchema.safeParse(BASE_COMISION);
    expect(result.success).toBe(true);
  });

  it("rechaza consignación sin nombre del propietario", () => {
    const result = vehicleSchema.safeParse({ ...BASE_COMISION, ownerName: "" });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("ownerName");
  });

  it("rechaza consignación sin contacto del propietario", () => {
    const result = vehicleSchema.safeParse({ ...BASE_COMISION, ownerPhone: "" });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("ownerPhone");
  });

  it("rechaza consignación sin precio de publicación", () => {
    const result = vehicleSchema.safeParse({ ...BASE_COMISION, targetPrice: "" });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("targetPrice");
  });

  it("NO requiere buyPrice en consignación", () => {
    const result = vehicleSchema.safeParse({ ...BASE_COMISION });
    expect(result.success).toBe(true);
  });

  it("no aplica validación cruzada de precios en consignación", () => {
    // En consignación no hay buyPrice; solo se valida targetPrice presente
    const result = vehicleSchema.safeParse({
      ...BASE_COMISION,
      targetPrice: "10000000",
    });
    expect(result.success).toBe(true);
  });
});

// ── Campos opcionales y coerción de tipos ───────────────────────────────────

describe("Campos opcionales y coerción", () => {
  it("convierte year string a número correctamente", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, year: "2019" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.year).toBe(2019);
  });

  it("convierte mileage string a número", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, mileage: "45000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.mileage).toBe(45000);
  });

  it("convierte buyPrice string a número", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, buyPrice: "300000000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.buyPrice).toBe(300000000);
  });

  it("acepta campos opcionales vacíos sin error", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      version: "",
      motor: "",
      traction: "",
      cityRegistration: "",
      mileage: "",
    });
    expect(result.success).toBe(true);
  });

  it("acepta prenda Sí con valor de prenda", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      legalStatus: "Sí",
      lienValue: "50000000",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.lienValue).toBe(50000000);
  });

  it("rechaza ownerType inválido", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, ownerType: "Arrendado" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("ownerType");
  });

  it("rechaza status inválido", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, status: "Perdido" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("status");
  });

  it("acepta todos los estados válidos", () => {
    const validStatuses = [
      "Disponible", "Separado", "Vendido", "En comisión", "En reparación",
      "En trámite", "Entregado", "Publicado", "No publicado", "Papeles pendientes",
    ];
    for (const status of validStatuses) {
      const result = vehicleSchema.safeParse({ ...BASE_PROPIO, status });
      expect(result.success, `Estado "${status}" debería ser válido`).toBe(true);
    }
  });
});

// ── fieldErrors flatten ─────────────────────────────────────────────────────

describe("fieldErrors — estructura para mensajes inline", () => {
  it("flatten() retorna fieldErrors con path correcto al fallar placa", () => {
    const result = vehicleSchema.safeParse({ ...BASE_PROPIO, plate: "AB" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.plate).toBeDefined();
      expect(flat.fieldErrors.plate?.[0]).toContain("3 caracteres");
    }
  });

  it("flatten() retorna múltiples fieldErrors en un solo parse", () => {
    const result = vehicleSchema.safeParse({
      ...BASE_PROPIO,
      buyPrice: "30000000",
      minPrice: "10000000",
      targetPrice: "20000000",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.minPrice).toBeDefined();
      expect(flat.fieldErrors.targetPrice).toBeDefined();
    }
  });
});
