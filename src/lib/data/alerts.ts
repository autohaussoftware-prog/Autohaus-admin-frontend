import { alerts as mockAlerts } from "@/data/mock";
import { createClient as getSupabaseServerClient } from "@/lib/supabase/server";

export type AppAlert = {
  id: string;
  title: string;
  description: string;
  priority: "Alta" | "Media" | "Baja";
  module: string;
};

export async function getAlerts(): Promise<AppAlert[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockAlerts as AppAlert[];

  const { data, error } = await supabase
    .from("alerts")
    .select("id,title,description,priority,module")
    .eq("status", "abierta")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("No se pudieron cargar alertas:", error?.message);
    return mockAlerts as AppAlert[];
  }

  return data.map((alert) => ({
    id: alert.id as string,
    title: alert.title as string,
    description: (alert.description as string | null) ?? "",
    priority: alert.priority as AppAlert["priority"],
    module: alert.module as string,
  }));
}

