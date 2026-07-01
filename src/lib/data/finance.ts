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

export type DateRange = { from?: string; to?: string };

function defaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split("T")[0];
}

function mapMovements(data: DbFinanceMovement[], categories: Map<string, string>): FinanceMovement[] {
  return data.map((m) => ({
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

export async function getFinanceMovements(dateRange?: DateRange): Promise<FinanceMovement[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockFinanceMovements;

  // Default to last 90 days when no range is given — prevents loading full history
  const from = dateRange?.from ?? defaultDateFrom();
  const to   = dateRange?.to;

  let query = supabase
    .from("finance_movements")
    .select("*")
    .is("deleted_at", null)
    .gte("date", from)
    .order("date", { ascending: false });
  if (to) query = query.lte("date", to);

  const [movementsResult, categoriesResult] = await Promise.all([
    query,
    supabase.from("finance_categories").select("id,name"),
  ]);

  if (movementsResult.error || !movementsResult.data) {
    console.error("No se pudieron cargar movimientos financieros:", movementsResult.error?.message);
    return mockFinanceMovements;
  }

  const categories = new Map(
    (categoriesResult.data ?? []).map((c) => [c.id as string, c.name as string])
  );

  return mapMovements(movementsResult.data as DbFinanceMovement[], categories);
}

export async function getBankMovements(dateRange?: DateRange): Promise<FinanceMovement[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockFinanceMovements.filter((m) => m.channel === "Banco");

  const from = dateRange?.from ?? defaultDateFrom();
  const to   = dateRange?.to;

  let query = supabase
    .from("finance_movements")
    .select("*")
    .is("deleted_at", null)
    .eq("channel", "Banco")
    .gte("date", from)
    .order("date", { ascending: false });
  if (to) query = query.lte("date", to);

  const [result, catResult] = await Promise.all([
    query,
    supabase.from("finance_categories").select("id,name"),
  ]);

  if (result.error || !result.data) return [];
  const categories = new Map(
    (catResult.data ?? []).map((c) => [c.id as string, c.name as string])
  );
  return mapMovements(result.data as DbFinanceMovement[], categories);
}

export async function getCashMovements(dateRange?: DateRange): Promise<FinanceMovement[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockFinanceMovements.filter((m) => m.channel !== "Banco");

  const from = dateRange?.from ?? defaultDateFrom();
  const to   = dateRange?.to;

  let query = supabase
    .from("finance_movements")
    .select("*")
    .is("deleted_at", null)
    .neq("channel", "Banco")
    .gte("date", from)
    .order("date", { ascending: false });
  if (to) query = query.lte("date", to);

  const [result, catResult] = await Promise.all([
    query,
    supabase.from("finance_categories").select("id,name"),
  ]);

  if (result.error || !result.data) return [];
  const categories = new Map(
    (catResult.data ?? []).map((c) => [c.id as string, c.name as string])
  );
  return mapMovements(result.data as DbFinanceMovement[], categories);
}

export type CreateFinanceMovementInput = {
  type: "Ingreso" | "Egreso";
  channel: "Banco" | "Efectivo José" | "Efectivo Tomás";
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

export async function getFinanceMovementById(id: string): Promise<FinanceMovement | null> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return null;

  const [movResult, catResult] = await Promise.all([
    supabase.from("finance_movements").select("*").eq("id", id).is("deleted_at", null).single(),
    supabase.from("finance_categories").select("id,name"),
  ]);

  if (movResult.error || !movResult.data) return null;
  const m = movResult.data as DbFinanceMovement;
  const categories = new Map(
    (catResult.data ?? []).map((c) => [c.id as string, c.name as string])
  );

  return {
    id: m.id,
    type: m.type,
    channel: m.channel,
    category: m.category_id ? (categories.get(m.category_id) ?? "") : "",
    concept: m.concept,
    amount: toAmount(m.amount),
    date: m.date,
    vehicleId: m.vehicle_id ?? undefined,
    responsible: m.responsible_name ?? "",
  };
}

export async function updateFinanceMovement(id: string, input: CreateFinanceMovementInput): Promise<void> {
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

  const { error } = await supabase
    .from("finance_movements")
    .update({
      type: input.type,
      channel: input.channel,
      category_id: categoryId,
      concept: input.concept.trim(),
      amount: input.amount,
      date: input.date,
      vehicle_id: input.vehicleId || null,
      responsible_name: input.responsibleName.trim(),
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) throw new Error(error.message ?? "No se pudo actualizar el movimiento.");
}

export async function deleteFinanceMovement(id: string, deletedBy: string, reason?: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase
    .from("finance_movements")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
      delete_reason: reason?.trim() || null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) throw new Error(error.message ?? "No se pudo eliminar el movimiento.");
}
