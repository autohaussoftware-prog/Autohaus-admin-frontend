import { Save, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AdvisorsList } from "@/components/shared/advisors-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createAdvisorAction } from "@/app/actions/advisors";
import { getUserRole } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function getAllAdvisors() {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data } = await supabase
    .from("advisors")
    .select("id,full_name,role,tipo,phone,email,active")
    .order("active", { ascending: false })
    .order("full_name");

  return (data ?? []).map((a: any) => ({
    id: a.id as string,
    name: a.full_name as string,
    role: a.role as string,
    tipo: (a.tipo ?? "interno") as string,
    phone: a.phone as string | null,
    email: a.email as string | null,
    active: Boolean(a.active),
  }));
}

async function getAvailableUsers() {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("active", true)
    .order("full_name");

  if (!profiles?.length) return [];

  const { data: linked } = await supabase
    .from("advisors")
    .select("user_id")
    .not("user_id", "is", null);

  const linkedIds = new Set((linked ?? []).map((a: any) => a.user_id as string));

  return profiles
    .filter((p: any) => !linkedIds.has(p.id))
    .map((p: any) => ({
      id: p.id as string,
      name: (p.full_name ?? p.email) as string,
      email: p.email as string,
      role: p.role as string,
    }));
}

export default async function AdvisorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const [advisors, availableUsers, role] = await Promise.all([
    getAllAdvisors(),
    getAvailableUsers(),
    getUserRole(),
  ]);

  const active = advisors.filter((a) => a.active).length;
  const inactive = advisors.filter((a) => !a.active).length;
  const canManage = ["owner", "partner", "admin", "gerente"].includes(role);

  return (
    <>
      <PageHeader
        eyebrow="Equipo comercial"
        title="Asesores"
        description="Gestión de captadores, vendedores y asesores vinculados a usuarios del sistema."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total asesores" value={`${advisors.length}`} helper="Registrados en el sistema" icon={Users} tone="gold" />
        <StatCard label="Activos" value={`${active}`} helper="Disponibles para asignar" icon={Users} tone="green" />
        <StatCard label="Inactivos" value={`${inactive}`} helper="Fuera de operación" icon={Users} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <CardTitle>Listado de asesores</CardTitle>
              <CardDescription>Activos primero. Cada asesor está vinculado a un usuario del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AdvisorsList advisors={advisors} canManage={canManage} />
            </CardContent>
          </Card>
        </div>

        {canManage && (
          <div>
            <Card>
              <CardHeader className="border-b border-zinc-900">
                <CardTitle>Vincular asesor</CardTitle>
                <CardDescription>Asocia un usuario existente como asesor.</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {params.error && (
                  <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {params.error}
                  </div>
                )}
                {params.success && (
                  <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Asesor registrado correctamente.
                  </div>
                )}

                {availableUsers.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Todos los usuarios activos ya tienen un asesor asignado. Crea un nuevo usuario desde{" "}
                    <a href="/usuarios" className="text-[#D6A93D] hover:underline">Usuarios</a> primero.
                  </p>
                ) : (
                  <form
                    action={async (formData) => {
                      "use server";
                      const { redirect } = await import("next/navigation");
                      const result = await createAdvisorAction(formData);
                      if (result?.error) {
                        redirect("/asesores?error=" + encodeURIComponent(result.error));
                      }
                      redirect("/asesores?success=1");
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Usuario *</label>
                      <Select name="userId" required>
                        <option value="">Seleccionar usuario...</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.email}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Rol *</label>
                      <Select name="role" defaultValue="Asesor">
                        <option value="Captador">Captador</option>
                        <option value="Vendedor">Vendedor</option>
                        <option value="Asesor">Asesor</option>
                        <option value="Gerente">Gerente</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Tipo *</label>
                      <Select name="tipo" defaultValue="interno">
                        <option value="interno">Interno</option>
                        <option value="externo">Externo</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Teléfono</label>
                      <Input name="phone" type="tel" placeholder="3001234567" />
                    </div>
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4" />
                      Vincular asesor
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
