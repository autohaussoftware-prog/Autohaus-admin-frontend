"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function PrendaFields({
  defaultLien = "No",
  defaultLienValue = "",
}: {
  defaultLien?: string;
  defaultLienValue?: string | number;
}) {
  const [hasPrenda, setHasPrenda] = useState<"Sí" | "No">(defaultLien === "Sí" ? "Sí" : "No");

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Prenda <span className="text-red-400">*</span>
        </span>
        <Select
          name="legalStatus"
          value={hasPrenda}
          onChange={(e) => setHasPrenda(e.target.value as "Sí" | "No")}
          required
        >
          <option value="No">No</option>
          <option value="Sí">Sí</option>
        </Select>
      </label>

      {hasPrenda === "Sí" && (
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Valor de la prenda (COP)</span>
          <Input
            name="lienValue"
            type="number"
            min="0"
            placeholder="Ej: 50000000"
            defaultValue={defaultLienValue?.toString()}
          />
        </label>
      )}
    </>
  );
}
