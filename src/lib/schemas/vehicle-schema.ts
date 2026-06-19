import { z } from "zod";
import { isValidPlate } from "@/lib/security";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().nonnegative().optional()
).optional();

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional()
).optional();

export const vehicleSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(3, "La placa debe tener al menos 3 caracteres.")
    .refine((v) => isValidPlate(v), "Formato inválido. Ejemplos válidos: ABC123, ABC1234, ABC123D."),
  brand: z.string().trim().min(2, "La marca es obligatoria."),
  line: z.string().trim().min(1, "La línea es obligatoria."),
  version: optionalText,
  year: z.preprocess(
    (v) => (v === "" || v === null ? undefined : Number(v)),
    z.number({ message: "El modelo (año) es obligatorio." }).positive("El año debe ser un número positivo.")
  ),
  mileage: optionalNumber,
  color: z.string().trim().min(1, "El color es obligatorio."),
  motor: optionalText,
  transmission: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["Manual", "Automática"] as const, { message: "Selecciona Manual o Automática." })
  ),
  fuel: z.string().trim().min(1, "El combustible es obligatorio."),
  traction: optionalText,
  cityRegistration: optionalText,
  legalStatus: z.enum(["Sí", "No"], { message: "Selecciona si el vehículo tiene prenda." }),
  lienValue: optionalNumber,
  status: z.enum([
    "Disponible", "Separado", "Vendido", "En comisión", "En reparación",
    "En trámite", "Entregado", "Publicado", "No publicado", "Papeles pendientes",
  ]),
  locationId: optionalText,
  ownerType: z.enum(["Propio", "Comisión"]),
  ownerName: optionalText,
  ownerPhone: optionalText,
  entryType: optionalText,
  buyPrice: optionalNumber,
  targetPrice: optionalNumber,
  minPrice: optionalNumber,
  estimatedCost: optionalNumber,
  realCost: optionalNumber,
  advisorBuyerId: optionalText,
  advisorSellerId: optionalText,
  soatDue: optionalText,
  technoDue: optionalText,
  notes: optionalText,
}).superRefine((data, ctx) => {
  // ── Reglas de consignación ───────────────────────────────────────
  if (data.ownerType === "Comisión") {
    if (!data.ownerName?.trim()) {
      ctx.addIssue({ code: "custom", path: ["ownerName"], message: "El nombre del propietario es obligatorio en consignación." });
    }
    if (!data.ownerPhone?.trim()) {
      ctx.addIssue({ code: "custom", path: ["ownerPhone"], message: "El contacto del propietario es obligatorio en consignación." });
    }
    if (!data.targetPrice) {
      ctx.addIssue({ code: "custom", path: ["targetPrice"], message: "El precio de publicación es obligatorio en consignación." });
    }
  }

  // ── Reglas de precios para vehículos propios ─────────────────────
  if (data.ownerType === "Propio") {
    if (data.buyPrice !== undefined && data.buyPrice === 0) {
      ctx.addIssue({ code: "custom", path: ["buyPrice"], message: "El precio de compra no puede ser $0." });
    }
    if (data.buyPrice && data.minPrice && data.minPrice < data.buyPrice) {
      ctx.addIssue({ code: "custom", path: ["minPrice"], message: "El precio mínimo no puede ser menor al precio de compra." });
    }
    if (data.buyPrice && data.targetPrice && data.targetPrice < data.buyPrice) {
      ctx.addIssue({ code: "custom", path: ["targetPrice"], message: "El precio de publicación no puede ser menor al precio de compra." });
    }
  }
});

export type VehicleSchemaInput = z.infer<typeof vehicleSchema>;

export type VehicleActionState = {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
  attempt: number;
  values?: Record<string, string>;
};
