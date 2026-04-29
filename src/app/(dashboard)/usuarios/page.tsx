import { ShieldCheck, UserCog, Users, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

const users = [
  { name: "Dueño principal", email: "dueno@autohaus.co", role: "Dueño", access: "Completo", status: "Activo" },
  { name: "Socio financiero", email: "socio.finanzas@autohaus.co", role: "Socio", access: "Completo", status: "Activo" },
  { name: "Socio comercial", email: "socio.comercial@autohaus.co", role: "Socio", access: "Comercial + reportes", status: "Activo" },
  { name: "Administrador", email: "admin@autohaus.co", role: "Admin", access: "Operativo", status: "Pendiente" },
];

export default function UsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Usuarios y permisos"
        title="Accesos internos"
        description="Primera versión enfocada en dueños y socios, dejando preparada la estructura para asesores, captadores, contabilidad y solo lectura."
        actionLabel="Crear usuario"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios" value={`${users.length}`} helper="Base inicial del MVP" icon={Users} tone="gold" />
        <StatCard label="Roles activos" value="3" helper="Dueño, socio y admin" icon={UserCog} tone="blue" />
        <StatCard label="Acceso completo" value="2" helper="Dueños y socios clave" icon={ShieldCheck} tone="green" />
        <StatCard label="Login obligatorio" value="Sí" helper="Por información sensible" icon={LockKeyhole} tone="red" />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Usuarios configurados</CardTitle>
          <CardDescription>Visual de roles antes de conectar autenticación real con Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Usuario</th>
                  <th className="px-5 py-4 font-medium">Rol</th>
                  <th className="px-5 py-4 font-medium">Acceso</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="border-b border-zinc-900/80 hover:bg-zinc-950/70">
                    <td className="px-5 py-4"><p className="font-medium text-white">{user.name}</p><p className="text-xs text-zinc-500">{user.email}</p></td>
                    <td className="px-5 py-4 text-zinc-300">{user.role}</td>
                    <td className="px-5 py-4 text-zinc-400">{user.access}</td>
                    <td className="px-5 py-4"><Badge tone={user.status === "Activo" ? "green" : "amber"}>{user.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
