"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSale } from "@/lib/data/sales";

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
