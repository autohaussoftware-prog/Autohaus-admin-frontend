"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { updateProfileAction, updatePasswordAction, type ProfileActionState } from "@/app/(dashboard)/perfil/actions";

const INIT: ProfileActionState = { error: null, attempt: 0 };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1.5">{children}</label>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-zinc-400">{title}</h2>
      {children}
    </div>
  );
}

export function ProfileForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string;
  defaultPhone: string;
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, INIT);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, INIT);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Datos personales">
        <form action={profileAction} className="space-y-4">
          <div>
            <FieldLabel>Nombre completo</FieldLabel>
            <Input name="full_name" defaultValue={defaultName} placeholder="Tu nombre" required />
          </div>
          <div>
            <FieldLabel>Teléfono / WhatsApp</FieldLabel>
            <Input name="phone" defaultValue={defaultPhone} placeholder="Ej: 3001234567" required />
          </div>

          {profileState.error && (
            <p className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {profileState.error}
            </p>
          )}
          {profileState.success && !profileState.error && (
            <p className="rounded-xl border border-green-900/40 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              Perfil actualizado correctamente.
            </p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="w-full rounded-xl bg-[#D6A93D] px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#c49835] disabled:opacity-50"
          >
            {profilePending ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Cambiar contraseña">
        <form action={passwordAction} className="space-y-4">
          <div>
            <FieldLabel>Nueva contraseña</FieldLabel>
            <Input name="password" type="password" placeholder="Mínimo 8 caracteres" required />
          </div>
          <div>
            <FieldLabel>Confirmar contraseña</FieldLabel>
            <Input name="confirmPassword" type="password" placeholder="Repite la contraseña" required />
          </div>

          {passwordState.error && (
            <p className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {passwordState.error}
            </p>
          )}
          {passwordState.success && !passwordState.error && (
            <p className="rounded-xl border border-green-900/40 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              Contraseña actualizada correctamente.
            </p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {passwordPending ? "Actualizando…" : "Cambiar contraseña"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
