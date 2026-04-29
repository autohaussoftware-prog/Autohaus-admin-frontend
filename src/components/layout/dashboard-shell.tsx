"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="flex min-h-screen">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="p-4 xl:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
