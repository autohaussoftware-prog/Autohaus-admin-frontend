import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
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
              <h1 className="text-2xl font-semibold text-white">Ingreso seguro</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Acceso reservado para dueños, socios y usuarios autorizados.
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Correo</label>
                <Input type="email" placeholder="usuario@autohaus.co" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Contraseña</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full" type="button">Entrar al sistema</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
