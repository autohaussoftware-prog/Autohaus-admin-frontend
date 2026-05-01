"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateSettingAction } from "@/app/actions/settings";
import type { AppSetting } from "@/lib/data/settings";

function SettingCard({ setting, canEdit }: { setting: AppSetting; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(setting.value);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayValue =
    setting.unit === "$"
      ? `$${Number(setting.value).toLocaleString("es-CO")}`
      : `${setting.value}${setting.unit}`;

  function handleSave() {
    if (!inputVal.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSettingAction(setting.key, inputVal.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleCancel() {
    setInputVal(setting.value);
    setEditing(false);
    setError(null);
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Badge tone="gold">{setting.groupName}</Badge>
          <h3 className="mt-3 text-sm font-semibold text-white">{setting.label}</h3>

          {editing ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5">
                {setting.unit === "$" && <span className="text-sm text-zinc-500">$</span>}
                <input
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
                />
                {setting.unit !== "$" && <span className="text-sm text-zinc-500">{setting.unit}</span>}
              </div>
              <button
                onClick={handleSave}
                disabled={pending}
                className="rounded-xl bg-[#D6A93D]/20 p-1.5 text-[#D6A93D] transition hover:bg-[#D6A93D]/30 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-xl border border-zinc-700 p-1.5 text-zinc-500 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className={`mt-2 text-2xl font-semibold ${saved ? "text-green-400" : "text-[#D6A93D]"}`}>
              {displayValue}
            </p>
          )}

          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>

        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-xl border border-zinc-800 p-1.5 text-zinc-600 transition hover:border-zinc-600 hover:text-zinc-300"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsPanel({
  settings,
  canEdit,
}: {
  settings: AppSetting[];
  canEdit: boolean;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <CardTitle>Parámetros del sistema</CardTitle>
        <CardDescription>
          {canEdit
            ? "Haz clic en el lápiz de cualquier parámetro para editarlo."
            : "Solo dueños y administradores pueden editar estos valores."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {settings.map((s) => (
          <SettingCard key={s.key} setting={s} canEdit={canEdit} />
        ))}
      </CardContent>
    </Card>
  );
}
