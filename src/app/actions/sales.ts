"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSale, confirmSaleFromReservation } from "@/lib/data/sales";
import { getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional()
);

const saleSchema = z.object({
  vehicleId: z.string().trim().min(1),
  customerName: z.string().trim().min(2),
  customerPhone: optionalText,
  customerDocument: optionalText,
  sellerId: optionalText,
  agreedPrice: z.preprocess((v) => Number(v), z.number().positive()),
  initialPayment: z.preprocess((v) => Number(v), z.number().nonnegative()),
  paymentStatus: z.enum(["pendiente", "parcial", "completo"]),
  documentStatus: z.enum(["pendiente", "en_tramite", "completo"]),
  deliveryStatus: z.enum(["pendiente", "programada", "completada"]),
  saleStatus: z.enum(["separacion", "vendido"]),
});

export async function createSaleAction(formData: FormData) {
  const parsed = saleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/ventas/nueva?error=" + encodeURIComponent(msg));
  }

  let saleId: string;
  try {
    saleId = await createSale(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la venta.";
    redirect("/ventas/nueva?error=" + encodeURIComponent(message));
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

  revalidatePath("/ventas");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${vehicleId}`);
  return { success: true };
}
