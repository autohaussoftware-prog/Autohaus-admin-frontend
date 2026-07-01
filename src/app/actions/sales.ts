"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSale, confirmSaleFromReservation, updateSaleStatuses, markSaleDelivered, updateConsignmentPaperwork, updateSaleCommission, cancelSale } from "@/lib/data/sales";
import { createVehicle } from "@/lib/data/vehicles";
import { createTraspasoFromSale } from "@/lib/data/traspasos";
import { getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";
import { sendSaleNotification } from "@/lib/email";
import { logAudit } from "@/lib/data/audit";

// In Zod v4, z.preprocess fires the nonoptional check before running fn.
// Adding .optional() on the outer wrapper lets undefined pass through correctly.
const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional()
).optional();

const PAYMENT_METHODS = ["Contado", "Transferencia", "Efectivo", "Mixto", "Crédito"] as const;

const optionalNumber = (nonneg = false) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    nonneg ? z.number().nonnegative().optional() : z.number().optional()
  ).optional();

const saleSchema = z.object({
  vehicleMode: z.enum(["inventory", "external"]).default("inventory"),
  vehicleId: optionalText,
  // External vehicle fields
  extPlate: optionalText,
  extBrand: optionalText,
  extLine: optionalText,
  extYear: optionalNumber(),
  extMileage: optionalNumber(true),
  extColor: optionalText,
  extOwnerName: optionalText,
  extOwnerPhone: optionalText,
  extOwnerDocument: optionalText,
  // Sale fields
  customerName: z.preprocess((v) => (v == null ? "" : String(v)), z.string().trim().min(2, "El nombre del cliente es obligatorio.")),
  customerPhone: z.preprocess((v) => (v == null ? "" : String(v)), z.string().trim().min(7, "El teléfono del cliente es obligatorio.")),
  customerDocument: optionalText,
  sellerId: optionalText,
  agreedPrice: z.preprocess((v) => Number(v), z.number().positive()),
  initialPayment: z.preprocess((v) => Number(v), z.number().nonnegative()),
  clientPaperworkAmount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().nonnegative()
  ),
  paymentStatus: z.enum(["pendiente", "parcial", "completo"]).default("pendiente"),
  documentStatus: z.enum(["pendiente", "en_tramite", "completo"]).default("pendiente"),
  deliveryStatus: z.enum(["pendiente", "programada", "completada"]).default("pendiente"),
  saleStatus: z.enum(["separacion", "vendido"]).default("separacion"),
  paymentMethod: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: "Forma de pago inválida." }) }).default("Contado"),
  expiryDate: optionalText,
  initialPaymentChannel: z.string().optional(),
}).superRefine((data, ctx) => {
  // Vehicle selection validation
  if (data.vehicleMode === "inventory") {
    if (!data.vehicleId?.trim()) {
      ctx.addIssue({ code: "custom", path: ["vehicleId"], message: "Selecciona un vehículo del inventario." });
    }
  } else {
    if (!data.extPlate?.trim()) ctx.addIssue({ code: "custom", path: ["extPlate"], message: "La placa es obligatoria." });
    if (!data.extBrand?.trim()) ctx.addIssue({ code: "custom", path: ["extBrand"], message: "La marca es obligatoria." });
    if (!data.extLine?.trim()) ctx.addIssue({ code: "custom", path: ["extLine"], message: "La línea es obligatoria." });
    if (!data.extOwnerName?.trim()) ctx.addIssue({ code: "custom", path: ["extOwnerName"], message: "El nombre del propietario es obligatorio." });
    if (!data.extOwnerPhone?.trim()) ctx.addIssue({ code: "custom", path: ["extOwnerPhone"], message: "El celular del propietario es obligatorio." });
  }
  // Expiry date validation
  const needsExpiry = data.saleStatus === "separacion" && data.paymentMethod !== "Crédito";
  if (needsExpiry && !data.expiryDate) {
    ctx.addIssue({ code: "custom", path: ["expiryDate"], message: "La fecha límite es obligatoria para separaciones que no son por crédito." });
  }
  if (data.expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(data.expiryDate) < today) {
      ctx.addIssue({ code: "custom", path: ["expiryDate"], message: "La fecha límite no puede ser una fecha pasada." });
    }
  }
});

export async function createSaleAction(formData: FormData) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente", "advisor", "accounting"].includes(role)) {
    redirect("/ventas/nueva?error=" + encodeURIComponent("Sin permisos para registrar ventas."));
  }

  const parsed = saleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/ventas/nueva?error=" + encodeURIComponent(msg));
  }

  const { id: userId, name } = await getCurrentUserProfile();

  // Create external vehicle first if not from inventory
  let vehicleId = parsed.data.vehicleId ?? "";
  if (parsed.data.vehicleMode === "external") {
    const isSold = parsed.data.saleStatus === "vendido";
    try {
      vehicleId = await createVehicle({
        plate: parsed.data.extPlate!,
        brand: parsed.data.extBrand!,
        line: parsed.data.extLine!,
        year: parsed.data.extYear,
        mileage: parsed.data.extMileage ?? 0,
        color: parsed.data.extColor,
        status: isSold ? "Vendido" : "Separado",
        ownerType: "Externo",
        targetPrice: parsed.data.agreedPrice,
        ownerName: parsed.data.extOwnerName,
        ownerPhone: parsed.data.extOwnerPhone,
        ownerDocument: parsed.data.extOwnerDocument,
        separated: !isSold,
        createdByUserId: userId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo registrar el vehículo externo.";
      redirect("/ventas/nueva?error=" + encodeURIComponent(message));
    }
  }

  let saleId: string;
  try {
    saleId = await createSale({ ...parsed.data, vehicleId, paymentMethod: parsed.data.paymentMethod, initialPaymentChannel: parsed.data.initialPaymentChannel, createdByUserId: userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la venta.";
    redirect("/ventas/nueva?error=" + encodeURIComponent(message));
  }

  logAudit({
    tableName: "sales",
    recordId: saleId,
    action: "INSERT",
    newValue: `${parsed.data.saleStatus} — $${parsed.data.agreedPrice} — vehículo ${vehicleId}`,
    userName: name,
    userId,
  }).catch(() => {});

  sendSaleNotification(saleId).catch(() => {});
  if (parsed.data.saleStatus === "vendido") {
    createTraspasoFromSale(saleId, name).catch(() => {});
  }

  revalidatePath("/ventas");
  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect("/ventas");
}

export async function confirmSaleAction(saleId: string, vehicleId: string) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "accounting"].includes(role)) {
    return { error: "Sin permisos para confirmar ventas." };
  }

  const { name } = await getCurrentUserProfile();

  try {
    await confirmSaleFromReservation(saleId, vehicleId, name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error confirmando venta." };
  }

  logAudit({
    tableName: "sales",
    recordId: saleId,
    action: "UPDATE",
    fieldChanged: "sale_status",
    oldValue: "separacion",
    newValue: "vendido",
    userName: name,
  }).catch(() => {});

  createTraspasoFromSale(saleId, name).catch(() => {});

  revalidatePath("/ventas");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath(`/ventas/${saleId}`);
  return { success: true };
}

export async function updateSaleStatusesAction(
  saleId: string,
  updates: { paymentStatus?: string; documentStatus?: string; deliveryStatus?: string }
) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "accounting", "advisor"].includes(role)) {
    return { error: "Sin permisos para actualizar estados." };
  }

  const { id: userId, name } = await getCurrentUserProfile();

  try {
    await updateSaleStatuses(saleId, updates);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando estado." };
  }

  logAudit({
    tableName: "sales",
    recordId: saleId,
    action: "UPDATE",
    newValue: JSON.stringify(updates),
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/ventas");
  return { success: true };
}

export async function markSaleDeliveredAction(
  saleId: string,
  vehicleId: string,
  checklist: string[]
) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "accounting"].includes(role)) {
    return { error: "Sin permisos para registrar entregas." };
  }

  const { name } = await getCurrentUserProfile();

  try {
    await markSaleDelivered(saleId, vehicleId, name, checklist);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error registrando entrega." };
  }

  logAudit({
    tableName: "sales",
    recordId: saleId,
    action: "UPDATE",
    fieldChanged: "delivery_status",
    newValue: "completada",
    userName: name,
  }).catch(() => {});

  revalidatePath("/ventas");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath(`/ventas/${saleId}`);
  return { success: true };
}

export async function updateCommissionAmountAction(
  saleId: string,
  vehicleId: string,
  _prev: { error: string | null; attempt: number },
  formData: FormData
): Promise<{ error: string | null; attempt: number }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para modificar el valor de la comisión.", attempt: _prev.attempt + 1 };
  }

  const raw = formData.get("commissionAmount");
  const amount = Number(raw);
  if (isNaN(amount) || amount < 0) {
    return { error: "El valor debe ser un número mayor o igual a $0.", attempt: _prev.attempt + 1 };
  }

  const { name } = await getCurrentUserProfile();

  try {
    await updateSaleCommission(saleId, vehicleId, amount, name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando comisión.", attempt: _prev.attempt + 1 };
  }

  revalidatePath(`/ventas/${saleId}`);
  return { error: null, attempt: _prev.attempt + 1 };
}

export async function updatePaperworkAmountAction(
  saleId: string,
  _prev: { error: string | null; attempt: number },
  formData: FormData
): Promise<{ error: string | null; attempt: number }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "accounting", "advisor"].includes(role)) {
    return { error: "Sin permisos.", attempt: _prev.attempt + 1 };
  }

  const raw = formData.get("clientPaperworkAmount");
  const amount = Number(raw);
  if (isNaN(amount) || amount < 0) {
    return { error: "El valor debe ser un número mayor o igual a $0.", attempt: _prev.attempt + 1 };
  }

  try {
    await updateConsignmentPaperwork(saleId, amount);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando valor.", attempt: _prev.attempt + 1 };
  }

  revalidatePath(`/ventas/${saleId}`);
  return { error: null, attempt: _prev.attempt + 1 };
}

export async function cancelSaleAction(
  saleId: string,
  vehicleId: string,
  deleteInitialPayment: boolean,
  reason?: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para cancelar ventas." };
  }

  const { name } = await getCurrentUserProfile();

  const { id: userId } = await getCurrentUserProfile();

  try {
    await cancelSale(saleId, deleteInitialPayment, name, reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error cancelando la venta." };
  }

  logAudit({
    tableName: "sales",
    recordId: saleId,
    action: "DELETE",
    newValue: reason ?? "sin motivo",
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/ventas");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${vehicleId}`);
  return {};
}
