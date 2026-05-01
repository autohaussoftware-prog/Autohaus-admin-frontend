import { LockKeyhole, ShieldCheck, UserCog, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { UserManagement } from "@/components/users/user-management";
import { getUsers } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();

  const active = users.filter((u) => u.active).length;
  const roles = new Set(users.map((u) => u.role)).size;
  const fullAccess = users.filter((u) => ["owner", "partner"].includes(u.role)).length;

  return (
    <>
      <PageHeader
        eyebrow="Usuarios y permisos"
        title="Accesos internos"
        description="Gestiona el equipo, invita colaboradores y controla los permisos de cada rol."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios totales" value={`${users.length}`} helper="Registrados en el sistema" icon={Users} tone="gold" />
        <StatCard label="Activos" value={`${active}`} helper="Con acceso habilitado" icon={UserCog} tone="blue" />
        <StatCard label="Acceso completo" value={`${fullAccess}`} helper="Dueños y socios" icon={ShieldCheck} tone="green" />
        <StatCard label="Login obligatorio" value="Sí" helper="Información sensible protegida" icon={LockKeyhole} tone="red" />
      </div>
      <UserManagement users={users} />
    </>
  );
}
