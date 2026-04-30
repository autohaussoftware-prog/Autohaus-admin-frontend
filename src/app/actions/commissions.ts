"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCommission } from "@/lib/data/commissions";

const commissionSchema = z.object({
  advisorId: z.string().trim().min(1),
  role: z.enum(["Captador", "Vendedor", "Crédito"]),
  vehicleId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().optional()
  ),
  amount: z.preprocess((v) => Number(v), z.number().positive()),
  month: z.string().min(7),
  status: z.enum(["Pendiente", "Pagada"]),
});

export async function createCommissionAction(formData: FormData) {
  const parsed = commissionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/comisiones/nueva?error=" + encodeURIComponent(msg));
  }

  try {
    await createCommission(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la comisión.";
    redirect("/comisiones/nueva?error=" + encodeURIComponent(message));
  }

  revalidatePath("/comisiones");
  redirect("/comisiones");
}
