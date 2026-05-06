"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createVehicleExpense, deleteVehicleExpense } from "@/lib/data/expenses";
import { getCurrentUserProfile } from "@/lib/supabase/server";

const expenseSchema = z.object({
  motivo: z.string().trim().min(2, "El motivo es obligatorio."),
  fecha: z.string().trim().min(1, "La fecha es obligatoria."),
  monto: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "El monto es obligatorio." }).positive("El monto debe ser mayor a $0.")
  ),
});

type State = { error: string | null; attempt: number };

export async function addExpenseAction(vehicleId: string, _prev: State, formData: FormData): Promise<State> {
  const raw = {
    motivo: formData.get("motivo"),
    fecha: formData.get("fecha"),
    monto: formData.get("monto"),
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los campos.", attempt: _prev.attempt + 1 };
  }

  const profile = await getCurrentUserProfile();

  const AUTHORIZED = ["owner", "partner", "admin", "gerente", "accounting"];
  if (!AUTHORIZED.includes(profile.role)) {
    return { error: "No tienes permiso para registrar gastos.", attempt: _prev.attempt + 1 };
  }

  try {
    await createVehicleExpense(vehicleId, parsed.data, profile.name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar el gasto.", attempt: _prev.attempt + 1 };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  return { error: null, attempt: _prev.attempt + 1 };
}

export async function deleteExpenseAction(expenseId: string, vehicleId: string): Promise<void> {
  const profile = await getCurrentUserProfile();
  const AUTHORIZED = ["owner", "partner", "admin"];
  if (!AUTHORIZED.includes(profile.role)) return;

  await deleteVehicleExpense(expenseId, vehicleId, profile.name);
  revalidatePath(`/vehiculos/${vehicleId}`);
}
