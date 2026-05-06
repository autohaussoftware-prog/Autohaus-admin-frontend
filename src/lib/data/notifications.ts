import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type DbNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error || !data) return [];

  return (data as DbNotification[]).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: n.created_at,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return count ?? 0;
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return;

  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    link: link ?? null,
  });
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return;

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

export async function getAdminAndManagerIds(): Promise<string[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["owner", "partner", "admin", "gerente"]);

  return (data ?? []).map((p: any) => p.id as string);
}
