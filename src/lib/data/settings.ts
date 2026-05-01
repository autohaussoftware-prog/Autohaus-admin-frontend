import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AppSetting = {
  key: string;
  value: string;
  label: string;
  groupName: string;
  unit: string;
  updatedAt: string;
};

const DEFAULTS: AppSetting[] = [
  { key: "commission_captador",   value: "20",       label: "Comisión captador",         groupName: "Comisiones",   unit: "%",  updatedAt: "" },
  { key: "commission_vendedor",   value: "20",       label: "Comisión vendedor",         groupName: "Comisiones",   unit: "%",  updatedAt: "" },
  { key: "commission_credito",    value: "33",       label: "Comisión crédito",          groupName: "Comisiones",   unit: "%",  updatedAt: "" },
  { key: "margin_min",            value: "3",        label: "Margen mínimo esperado",    groupName: "Rentabilidad", unit: "%",  updatedAt: "" },
  { key: "cash_alert_threshold",  value: "30000000", label: "Alerta movimiento grande",  groupName: "Efectivo",     unit: "$",  updatedAt: "" },
];

export async function getSettings(): Promise<AppSetting[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return DEFAULTS;

  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value, label, group_name, unit, updated_at")
    .order("group_name");

  if (error || !data?.length) return DEFAULTS;

  return data.map((s) => ({
    key: s.key,
    value: s.value,
    label: s.label,
    groupName: s.group_name,
    unit: s.unit ?? "",
    updatedAt: s.updated_at,
  }));
}
