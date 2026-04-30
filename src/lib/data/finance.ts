import { financeMovements as mockFinanceMovements } from "@/data/mock";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { FinanceMovement } from "@/types/finance";

type DbFinanceMovement = {
  id: string;
  type: FinanceMovement["type"];
  channel: FinanceMovement["channel"];
  concept: string;
  amount: number | string;
  date: string;
  vehicle_id: string | null;
  responsible_name: string | null;
  category_id: string | null;
};

function toAmount(value: number | string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getFinanceMovements(): Promise<FinanceMovement[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockFinanceMovements;

  const [movementsResult, categoriesResult] = await Promise.all([
    supabase.from("finance_movements").select("*").order("date", { ascending: false }),
    supabase.from("finance_categories").select("id,name"),
  ]);

  if (movementsResult.error || !movementsResult.data) {
    console.error("No se pudieron cargar movimientos financieros:", movementsResult.error?.message);
    return mockFinanceMovements;
  }

  const categories = new Map(
    (categoriesResult.data ?? []).map((c) => [c.id as string, c.name as string])
  );

  return (movementsResult.data as DbFinanceMovement[]).map((m) => ({
    id: m.id,
    type: m.type,
    channel: m.channel,
    category: m.category_id ? categories.get(m.category_id) ?? "Sin categoría" : "Sin categoría",
    concept: m.concept,
    amount: toAmount(m.amount),
    date: m.date,
    vehicleId: m.vehicle_id ?? undefined,
    responsible: m.responsible_name ?? "Sin responsable",
  }));
}

export async function getBankMovements() {
  const movements = await getFinanceMovements();
  return movements.filter((m) => m.channel === "Banco");
}

export async function getCashMovements() {
  const movements = await getFinanceMovements();
  return movements.filter((m) => m.channel !== "Banco");
}

export type CreateFinanceMovementInput = {
  type: "Ingreso" | "Egreso";
  channel: "Banco" | "Efectivo ubicación 1" | "Efectivo ubicación 2";
  category?: string;
  concept: string;
  amount: number;
  date: string;
  vehicleId?: string;
  responsibleName: string;
};

export async function createFinanceMovement(input: CreateFinanceMovementInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  let categoryId: string | null = null;
  if (input.category?.trim()) {
    const { data: existing } = await supabase
      .from("finance_categories")
      .select("id")
      .ilike("name", input.category.trim())
      .maybeSingle();

    if (existing) {
      categoryId = existing.id as string;
    } else {
      const { data: newCat } = await supabase
        .from("finance_categories")
        .insert({ name: input.category.trim(), affects_vehicle_cost: false })
        .select("id")
        .single();
      if (newCat) categoryId = newCat.id as string;
    }
  }

  const { data, error } = await supabase
    .from("finance_movements")
    .insert({
      type: input.type,
      channel: input.channel,
      category_id: categoryId,
      concept: input.concept.trim(),
      amount: input.amount,
      date: input.date,
      vehicle_id: input.vehicleId || null,
      responsible_name: input.responsibleName.trim(),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "No se pudo registrar el movimiento.");
  return data.id as string;
}
