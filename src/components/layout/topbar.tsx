"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Plus, Search } from "lucide-react";
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
          <form
            className="relative w-full max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value.trim();
              if (input) router.push(`/inventario?q=${encodeURIComponent(input)}`);
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input name="q" className="pl-9" placeholder="Buscar por placa, marca o modelo… (Enter)" />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Alertas">
            <Bell className="h-4 w-4" />
          </Button>
          <Link href="/movimientos/nuevo" className="hidden md:inline-flex items-center gap-2 rounded-2xl bg-[#D6A93D] px-4 py-2 text-sm font-medium text-black hover:bg-[#c49835] transition-colors">
            <Plus className="h-4 w-4" />
            Registrar movimiento
          </Link>
          <Button variant="outline" size="icon" aria-label="Cerrar sesión" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
