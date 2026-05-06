import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/data/notifications";
import { markAllReadAction } from "./actions";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotificacionesPage() {
  const profile = await getCurrentUserProfile();
  const notifications = profile.id ? await getNotifications(profile.id) : [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Notificaciones"
        description="Alertas y novedades de tu actividad en la plataforma."
      />

      {hasUnread && (
        <div className="mb-4 flex justify-end">
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
        {notifications.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-500">
            No tienes notificaciones aún.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-900">
            {notifications.map((n) => (
              <li key={n.id} className={`flex items-start gap-4 px-5 py-4 ${!n.read ? "bg-zinc-900/40" : ""}`}>
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${!n.read ? "bg-[#D6A93D]/10" : "bg-zinc-800"}`}>
                  <Bell className={`h-4 w-4 ${!n.read ? "text-[#D6A93D]" : "text-zinc-500"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${!n.read ? "text-white" : "text-zinc-400"}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">{n.message}</p>
                  <p className="mt-1 text-xs text-zinc-600">{fmtDate(n.createdAt)}</p>
                </div>
                {n.link && (
                  <Link
                    href={n.link}
                    className="flex-shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
                  >
                    Ver
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
