"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Stage = "loading" | "form" | "success" | "error";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !["invite", "recovery"].includes(type ?? "")) {
      setErrorMsg("El enlace no es válido o ya fue utilizado.");
      setStage("error");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken ?? "" })
      .then(({ error }) => {
        if (error) {
          setErrorMsg("El enlace expiró o ya fue utilizado. Solicita uno nuevo.");
          setStage("error");
        } else {
          setStage("form");
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setErrorMsg("");
    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setPending(false);
    } else {
      setStage("success");
      setTimeout(() => router.push("/"), 2000);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo-full.jpg"
            alt="Autohaus"
            width={320}
            height={160}
            className="h-44 w-auto object-contain"
            priority
          />
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-zinc-500">Admin Control</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="mb-4 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-[#D6A93D]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold text-white">
                {stage === "success" ? "¡Contraseña guardada!" : "Crear contraseña"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {stage === "success"
                  ? "Redirigiendo al sistema…"
                  : "Elige una contraseña segura para tu cuenta."}
              </p>
            </div>

            {stage === "loading" && (
              <p className="text-sm text-zinc-500">Verificando enlace…</p>
            )}

            {stage === "error" && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            {stage === "success" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Contraseña actualizada correctamente.
              </div>
            )}

            {stage === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Nueva contraseña</label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Confirmar contraseña</label>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Guardando…" : "Guardar contraseña"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
