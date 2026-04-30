"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900 bg-[#050505]/88 px-4 py-3 backdrop-blur-xl xl:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Abrir menú">
            <Menu className="h-4 w-4" />
          </Button>
          {/* Logo visible solo en mobile (en desktop lo muestra la sidebar) */}
          <Image
            src="/logo-icon.jpg"
            alt="Autohaus"
            width={52}
            height={52}
            className="h-11 w-11 rounded-xl object-cover lg:hidden"
            priority
          />
          <div className="min-w-0 hidden lg:block">
            <p className="text-xs uppercase tracking-[0.24em] text-[#D6A93D]">Sistema administrativo</p>
            <h1 className="truncate text-xl font-semibold text-white md:text-2xl">Control Center</h1>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center px-6 xl:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input className="pl-9" placeholder="Buscar placa, vehículo, cliente, asesor o movimiento" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Alertas">
            <Bell className="h-4 w-4" />
          </Button>
          <Button className="hidden md:inline-flex">Registrar movimiento</Button>
          <Button variant="outline" size="icon" aria-label="Cerrar sesión" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
