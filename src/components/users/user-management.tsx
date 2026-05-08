"use client";

import { useState, useTransition } from "react";
import { Loader2, MailPlus, UserX, UserCheck, Send, Copy, Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inviteUserAction, updateUserRoleAction, toggleUserActiveAction, resendInviteAction } from "@/app/actions/users";
import { ChangePasswordButton } from "@/components/users/change-password-button";
import type { AppUser } from "@/lib/data/users";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Dueño",
  partner: "Socio",
  admin: "Administrador",
  gerente: "Gerente",
  advisor: "Asesor",
  accounting: "Contabilidad",
  viewer: "Solo lectura",
  inversionista: "Inversionista",
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

function CopyLinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="rounded-xl border border-amber-700/40 bg-amber-500/10 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
        <Link className="h-3.5 w-3.5" />
        Correo no enviado — comparte este link manualmente
      </div>
      <p className="text-xs text-zinc-500 break-all leading-relaxed">{link}</p>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/30 transition"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "¡Copiado!" : "Copiar link"}
      </button>
      <p className="text-xs text-zinc-600">Este link expira en 24 horas.</p>
    </div>
  );
}

function InviteForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("advisor");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setInviteLink(null);
    startTransition(async () => {
      const result = await inviteUserAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setEmailSent(result.emailSent ?? false);
        setInviteLink(result.inviteLink ?? null);
        (e.target as HTMLFormElement).reset();
        setSelectedRole("advisor");
      }
    });
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setInviteLink(null);
    setEmailSent(false);
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 w-full sm:w-80">
      <p className="mb-4 text-sm font-medium text-white">Invitar nuevo usuario</p>

      {inviteLink ? (
        <div className="space-y-3">
          {emailSent ? (
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              Correo enviado exitosamente.
            </div>
          ) : (
            <CopyLinkBox link={inviteLink} />
          )}
          <Button type="button" size="sm" className="w-full" onClick={handleClose}>
            Listo
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="correo@empresa.com" required className="h-9 text-sm" />
          <Input name="fullName" type="text" placeholder="Nombre completo" required className="h-9 text-sm" />
          <div>
            <p className="mb-1 text-xs text-zinc-500">Rol del sistema</p>
            <select
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 focus:border-[#D6A93D] focus:outline-none"
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {selectedRole === "advisor" && (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500">
              Después de crear el usuario ve a <strong className="text-zinc-400">Asesores</strong> para vincularlo.
            </p>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending} className="flex-1">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear invitación"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ResendInvite({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleResend() {
    setLink(null);
    startTransition(async () => {
      const result = await resendInviteAction(userId);
      if (result && "inviteLink" in result && result.inviteLink) {
        setLink(result.inviteLink);
        setEmailSent(result.emailSent ?? false);
      }
    });
  }

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (link) {
    return (
      <div className="flex items-center gap-1">
        {emailSent ? (
          <span className="text-xs text-emerald-400">Enviado</span>
        ) : (
          <button
            onClick={copy}
            title="Copiar link de invitación"
            className="flex items-center gap-1 rounded-lg border border-amber-700/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleResend}
      disabled={pending}
      title="Reenviar invitación"
      className="flex items-center gap-1.5 rounded-xl border border-amber-700/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
      Reenviar
    </button>
  );
}

export function UserManagement({ users }: { users: AppUser[] }) {
  const pending = users.filter((u) => !u.confirmed);
  const active = users.filter((u) => u.confirmed);

  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Usuarios del sistema</CardTitle>
            <CardDescription>
              {pending.length > 0
                ? `${active.length} activos · ${pending.length} con invitación pendiente`
                : `${active.length} usuarios activos`}
            </CardDescription>
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
                <th className="px-5 py-4 font-medium">Invitado</th>
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
                    {!user.confirmed ? (
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                        Pendiente
                      </span>
                    ) : user.active ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {!user.confirmed && <ResendInvite userId={user.id} />}
                      <ChangePasswordButton userId={user.id} userName={user.fullName || user.email} />
                      <ToggleActive userId={user.id} active={user.active} />
                    </div>
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
