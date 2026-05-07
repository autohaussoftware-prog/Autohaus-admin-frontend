"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSale, confirmSaleFromReservation, updateSaleStatuses, markSaleDelivered, updateConsignmentPaperwork, updateSaleCommission, cancelSale } from "@/lib/data/sales";
import { createTraspasoFromSale } from "@/lib/data/traspasos";
import { getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";
import { sendSaleNotification } from "@/lib/email";

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional()
);

const PAYMENT_METHODS = ["Contado", "Transferencia", "Efectivo", "Mixto", "Crédito"] as const;

const saleSchema = z.object({
  vehicleId: z.string().trim().min(1),
  customerName: z.string().trim().min(2, "El nombre del cliente es obligatorio."),
  customerPhone: z.string().trim().min(7, "El teléfono del cliente es obligatorio."),
  customerDocument: optionalText,
  sellerId: optionalText,
  agreedPrice: z.preprocess((v) => Number(v), z.number().positive()),
  initialPayment: z.preprocess((v) => Number(v), z.number().nonnegative()),
  clientPaperworkAmount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().nonnegative()
  ),
  paymentStatus: z.enum(["pendiente", "parcial", "completo"]),
  documentStatus: z.enum(["pendiente", "en_tramite", "completo"]),
  deliveryStatus: z.enum(["pendiente", "programada", "completada"]),
  saleStatus: z.enum(["separacion", "vendido"]),
  paymentMethod: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: "Forma de pago inválida." }) }),
  expiryDate: optionalText,
  initialPaymentChannel: z.string().optional(),
}).superRefine((data, ctx) => {
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
  const parsed = saleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/ventas/nueva?error=" + encodeURIComponent(msg));
  }

  const { id: userId, name } = await getCurrentUserProfile();

  let saleId: string;
  try {
    saleId = await createSale({ ...parsed.data, paymentMethod: parsed.data.paymentMethod, initialPaymentChannel: parsed.data.initialPaymentChannel, createdByUserId: userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la venta.";
    redirect("/ventas/nueva?error=" + encodeURIComponent(message));
  }

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

  try {
    await updateSaleStatuses(saleId, updates);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando estado." };
  }

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

  try {
    await cancelSale(saleId, deleteInitialPayment, name, reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error cancelando la venta." };
  }

  revalidatePath("/ventas");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${vehicleId}`);
  return {};
}
