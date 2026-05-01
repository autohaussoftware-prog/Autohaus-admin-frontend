"use client";

import { useState } from "react";
import { Loader2, UserCheck, UserX } from "lucide-react";

export function ToggleActiveButton({
  id,
  active,
  name,
  onToggle,
}: {
  id: string;
  active: boolean;
  name: string;
  onToggle: (id: string, newActive: boolean) => Promise<{ error?: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const action = active ? "desactivar" : "activar";
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a ${name}?`)) return;
    setLoading(true);
    setError(null);
    const result = await onToggle(id, !active);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  if (error) return <span className="text-xs text-red-400">{error}</span>;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        active
          ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : active ? (
        <UserX className="h-3 w-3" />
      ) : (
        <UserCheck className="h-3 w-3" />
      )}
      {active ? "Desactivar" : "Activar"}
    </button>
  );
}
