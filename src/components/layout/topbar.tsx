"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ onOpenSidebar, unreadCount = 0 }: { onOpenSidebar: () => void; unreadCount?: number }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(7,7,7,0.85)] px-4 py-3 backdrop-blur-xl xl:px-6">
      <div className="flex items-center justify-between gap-4">

        {/* Left: hamburger + mobile logo */}
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Abrir menú">
            <Menu className="h-4 w-4" />
          </Button>
          <Image
            src="/logo-autohaus.png"
            alt="Autohaus"
            width={110}
            height={24}
            className="h-6 w-auto object-contain invert lg:hidden"
            priority
          />
          <div className="hidden lg:block">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4A843]">Sistema administrativo</p>
            <h1 className="text-lg font-semibold leading-tight text-white">Panel de control</h1>
          </div>
        </div>

        {/* Center: search */}
        <div className="hidden flex-1 items-center justify-center px-6 xl:flex">
          <form
            className="relative w-full max-w-lg"
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value.trim();
              if (input) router.push(`/inventario?q=${encodeURIComponent(input)}`);
            }}
          >
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <Input name="q" className="pl-10 h-9 text-xs" placeholder="Buscar placa, marca, modelo… (Enter)" />
          </form>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Link href="/notificaciones" className="relative" aria-label="Notificaciones">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4A843] text-[10px] font-bold text-black leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          <Link
            href="/movimientos/nuevo"
            className="hidden md:inline-flex items-center gap-2 rounded-xl bg-[#D4A843] px-3.5 py-2 text-xs font-semibold text-black transition-all hover:bg-[#E8BC55] active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            Movimiento
          </Link>

          <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
