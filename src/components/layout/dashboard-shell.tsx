"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import type { UserRole } from "@/types/auth";

export function DashboardShell({
  children,
  role,
  unreadCount = 0,
}: {
  children: React.ReactNode;
  role: UserRole;
  unreadCount?: number;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-w-0 flex-1">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} unreadCount={unreadCount} />
        <main className="p-4 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
