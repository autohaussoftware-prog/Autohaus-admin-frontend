import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUserRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getUserRole();
  return <DashboardShell role={role}>{children}</DashboardShell>;
}
