"use client";

import { useState, useTransition } from "react";
import { Loader2, MailPlus, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inviteUserAction, updateUserRoleAction, toggleUserActiveAction } from "@/app/actions/users";
import type { AppUser } from "@/lib/data/users";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Dueño",
  partner: "Socio",
  admin: "Administrador",
  advisor: "Asesor",
  accounting: "Contabilidad",
  viewer: "Solo lectura",
};

function RoleSelect({ userId, current }: { userId: string; current: UserRole }) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<UserRole>(current);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole;
    setValue(newRole);
    startTransition(async () => {
      await updateUserRoleAction(userId, newRole);
    });
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        disabled={pending}
        className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 focus:border-[#D6A93D] focus:outline-none disabled:opacity-50"
      >
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </select>
      {pending && <Loader2 className="absolute right-2 top-2 h-3.5 w-3.5 animate-spin text-zinc-500" />}
    </div>
  );
}

function ToggleActive({ userId, active }: { userId: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(active);

  function handleToggle() {
    const next = !isActive;
    setIsActive(next);
    startTransition(async () => {
      await toggleUserActiveAction(userId, next);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      title={isActive ? "Desactivar usuario" : "Activar usuario"}
      className="rounded-xl border border-zinc-800 p-1.5 text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isActive ? (
        <UserX className="h-3.5 w-3.5" />
      ) : (
        <UserCheck className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function InviteForm() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFeedback(null);
    startTransition(async () => {
      const result = await inviteUserAction(fd);
      if (result?.error) {
        setFeedback({ type: "error", msg: result.error });
      } else {
        setFeedback({ type: "ok", msg: "Invitación enviada. El usuario recibirá un email para activar su cuenta." });
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setOpen(false), 2000);
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <MailPlus className="h-4 w-4" />
        Invitar usuario
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="mb-4 text-sm font-medium text-white">Invitar nuevo usuario</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="email" type="email" placeholder="correo@empresa.com" required className="h-9 text-sm" />
        <Input name="fullName" type="text" placeholder="Nombre completo" className="h-9 text-sm" />
        <select
          name="role"
          className="w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 focus:border-[#D6A93D] focus:outline-none"
        >
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>

        {feedback && (
          <p className={`text-xs ${feedback.type === "ok" ? "text-green-400" : "text-red-400"}`}>
            {feedback.msg}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending} className="flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar invitación"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => { setOpen(false); setFeedback(null); }}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export function UserManagement({ users }: { users: AppUser[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Usuarios del sistema</CardTitle>
            <CardDescription>Gestiona roles y accesos del equipo desde aquí.</CardDescription>
          </div>
          <InviteForm />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">Usuario</th>
                <th className="px-5 py-4 font-medium">Rol</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Registrado</th>
                <th className="px-5 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-900/80 hover:bg-zinc-950/70">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{user.fullName}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </td>
                  <td className="px-5 py-4 w-44">
                    <RoleSelect userId={user.id} current={user.role} />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <ToggleActive userId={user.id} active={user.active} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-zinc-500">
                    No hay usuarios registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
