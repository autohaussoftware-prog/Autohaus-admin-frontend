"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck, X } from "lucide-react";
import { changePasswordAction } from "@/app/actions/users";

export function ChangePasswordButton({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setPassword("");
    setConfirm("");
    setError(null);
    setSuccess(false);
    setShowPass(false);
    setShowConfirm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setError(null);

    const fd = new FormData();
    fd.set("password", password);
    fd.set("confirmPassword", confirm);

    startTransition(async () => {
      const result = await changePasswordAction(userId, fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  const mismatch = password && confirm && password !== confirm;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Cambiar contraseña"
        className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
      >
        <KeyRound className="h-3 w-3" />
        Cambiar clave
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/70" onClick={close} aria-label="Cerrar" />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/30 p-3">
                  <ShieldCheck className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Contraseña actualizada</p>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    La nueva clave de <span className="font-medium text-zinc-200">{userName}</span> está activa de inmediato.
                    Se envió una notificación a su correo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-2xl border border-zinc-700 px-6 py-2 text-sm text-zinc-300 transition hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-2.5">
                    <KeyRound className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Cambiar contraseña</h2>
                    <p className="text-xs text-zinc-500">{userName}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-zinc-500">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres con letras y números"
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 pr-10 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && password.length < 8 && (
                      <p className="mt-1 text-xs text-amber-400">Mínimo 8 caracteres ({password.length}/8)</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-zinc-500">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        autoComplete="new-password"
                        className={`w-full rounded-2xl border bg-zinc-900 px-3 py-2 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none ${mismatch ? "border-red-700 focus:border-red-600" : "border-zinc-700 focus:border-[#D6A93D]"}`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {mismatch && (
                      <p className="mt-1 text-xs text-red-400">Las contraseñas no coinciden.</p>
                    )}
                  </div>

                  {error && (
                    <p className="rounded-2xl border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || !password || !confirm || Boolean(mismatch)}
                      className="flex-1 rounded-2xl border border-[#D6A93D]/50 bg-[#D6A93D]/10 px-4 py-2 text-sm font-medium text-[#D6A93D] transition hover:bg-[#D6A93D]/20 disabled:opacity-50"
                    >
                      {isPending ? "Guardando…" : "Guardar contraseña"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
