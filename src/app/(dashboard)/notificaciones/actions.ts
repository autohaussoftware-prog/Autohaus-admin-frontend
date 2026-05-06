"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { markAllRead } from "@/lib/data/notifications";

export async function markAllReadAction(): Promise<void> {
  const profile = await getCurrentUserProfile();
  if (!profile.id) return;
  await markAllRead(profile.id);
  revalidatePath("/notificaciones");
  revalidatePath("/");
}
