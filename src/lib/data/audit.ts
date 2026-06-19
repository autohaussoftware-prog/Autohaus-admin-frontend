import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AuditEntry = {
  tableName: string;
  recordId: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  userName: string;
  userId?: string;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    table_name: entry.tableName,
    record_id: entry.recordId,
    action: entry.action,
    field_changed: entry.fieldChanged ?? null,
    old_value: entry.oldValue ?? null,
    new_value: entry.newValue ?? null,
    user_name: entry.userName,
    user_id: entry.userId ?? null,
  });
}
