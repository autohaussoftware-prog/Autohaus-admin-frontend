import { financeMovements as mockFinanceMovements } from "@/data/mock";
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

export async function getFinanceMovements() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockFinanceMovements;

  const [movementsResult, categoriesResult] = await Promise.all([
    supabase.from("finance_movements").select("*").order("date", { ascending: false }),
    supabase.from("finance_categories").select("id,name"),
  ]);

  if (movementsResult.error || !movementsResult.data) {
    console.error("No se pudieron cargar movimientos financieros:", movementsResult.error?.message);
    return mockFinanceMovements;
  }

  const categories = new Map((categoriesResult.data ?? []).map((category) => [category.id as string, category.name as string]));

  return (movementsResult.data as DbFinanceMovement[]).map((movement) => ({
    id: movement.id,
    type: movement.type,
    channel: movement.channel,
    category: movement.category_id ? categories.get(movement.category_id) ?? "Sin categoría" : "Sin categoría",
    concept: movement.concept,
    amount: toAmount(movement.amount),
    date: movement.date,
    vehicleId: movement.vehicle_id ?? undefined,
    responsible: movement.responsible_name ?? "Sin responsable",
  }));
}

export async function getBankMovements() {
  const movements = await getFinanceMovements();
  return movements.filter((movement) => movement.channel === "Banco");
}

export async function getCashMovements() {
  const movements = await getFinanceMovements();
  return movements.filter((movement) => movement.channel !== "Banco");
}

