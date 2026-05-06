import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { getUnreadCount } from "@/lib/data/notifications";

export const dynamic = "force-dynamic";

export default async function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile();
  const unreadCount = profile.id ? await getUnreadCount(profile.id) : 0;
  return <DashboardShell role={profile.role} unreadCount={unreadCount}>{children}</DashboardShell>;
}
