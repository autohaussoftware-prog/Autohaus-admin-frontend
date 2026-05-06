"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { createOrderAction } from "@/app/(dashboard)/pedidos/nuevo/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BRAND_NAMES, getLinesForBrand } from "@/data/car-catalog";

const OTHER = "__other__";
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 + 2 }, (_, i) => CURRENT_YEAR + 1 - i);

const BUDGETS = [
  "Hasta $30M",
  "$30M – $60M",
  "$60M – $100M",
  "$100M – $150M",
  "$150M – $250M",
  "Más de $250M",
];

const PAYMENT_METHODS = ["Contado", "Crédito", "Mixto (contado + crédito)"];

const COLORS = [
  "Negro",
  "Blanco",
  "Gris",
  "Plata",
  "Azul",
  "Rojo",
  "Verde",
  "Beige / Crema",
  "Marrón / Café",
  "Naranja",
  "Sin preferencia",
];

function FormFields({ values }: { values?: Record<string, string> }) {
  const initBrand = () => {
    if (!values?.brand) return "";
    return BRAND_NAMES.includes(values.brand) ? values.brand : OTHER;
  };
  const [selectedBrand, setSelectedBrand] = useState<string>(initBrand);
  const [customBrand, setCustomBrand] = useState(selectedBrand === OTHER ? (values?.brand ?? "") : "");

  const activeBrand = selectedBrand === OTHER ? customBrand : selectedBrand;
  const lines = getLinesForBrand(activeBrand);

  const initLine = () => {
    if (!values?.line) return "";
    return lines.includes(values.line) ? values.line : OTHER;
  };
  const [selectedLine, setSelectedLine] = useState<string>(initLine);
  const [customLine, setCustomLine] = useState(selectedLine === OTHER ? (values?.line ?? "") : "");

  function handleBrandChange(value: string) {
    setSelectedBrand(value);
    setCustomBrand("");
    setSelectedLine("");
    setCustomLine("");
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Vehículo buscado</CardTitle>
          <CardDescription>Características del vehículo que desea el cliente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Marca */}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Marca <span className="text-red-400">*</span></span>
            <Select
              name={selectedBrand === OTHER ? undefined : "brand"}
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value)}
              required={selectedBrand !== OTHER}
            >
              <option value="" disabled>Selecciona marca</option>
              {BRAND_NAMES.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value={OTHER}>Otra marca…</option>
            </Select>
          </label>

          {selectedBrand === OTHER && (
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Marca (escribir) <span className="text-red-400">*</span></span>
              <Input
                name="brand"
                required
                placeholder="Ej: Lexus, Infiniti…"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
              />
            </label>
          )}

          {/* Línea */}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Línea <span className="text-red-400">*</span></span>
            {lines.length > 0 ? (
              <Select
                name={selectedLine === OTHER ? undefined : "line"}
                value={selectedLine}
                onChange={(e) => { setSelectedLine(e.target.value); setCustomLine(""); }}
                required={selectedLine !== OTHER}
              >
                <option value="" disabled>Selecciona línea</option>
                {lines.map((l) => <option key={l} value={l}>{l}</option>)}
                <option value={OTHER}>Otra línea…</option>
              </Select>
            ) : (
              <Input
                name="line"
                required
                placeholder="Ej: Tucson, Tiguan, Hilux…"
                value={selectedLine === OTHER ? customLine : (values?.line ?? "")}
                onChange={(e) => { setSelectedLine(OTHER); setCustomLine(e.target.value); }}
              />
            )}
          </label>

          {selectedLine === OTHER && lines.length > 0 && (
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Línea (escribir) <span className="text-red-400">*</span></span>
              <Input
                name="line"
                required
                placeholder="Escribe la línea"
                value={customLine}
                onChange={(e) => setCustomLine(e.target.value)}
              />
            </label>
          )}

          {/* Modelo (año) */}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Modelo (año) <span className="text-red-400">*</span></span>
            <Select name="year" required defaultValue={values?.year ?? ""}>
              <option value="" disabled>Selecciona año</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </label>

          {/* Presupuesto */}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Presupuesto <span className="text-red-400">*</span></span>
            <Select name="budget" required defaultValue={values?.budget ?? ""}>
              <option value="" disabled>Selecciona rango</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </label>

          {/* Forma de pago */}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Forma de pago <span className="text-red-400">*</span></span>
            <Select name="paymentMethod" required defaultValue={values?.paymentMethod ?? ""}>
              <option value="" disabled>Selecciona forma de pago</option>
              {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </label>

          {/* Color de preferencia */}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Color de preferencia <span className="text-red-400">*</span></span>
            <Select name="colorPreference" required defaultValue={values?.colorPreference ?? ""}>
              <option value="" disabled>Selecciona color</option>
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </label>

          {/* Observaciones */}
          <label className="block md:col-span-2 xl:col-span-3">
            <span className="mb-2 block text-sm text-zinc-400">Observaciones</span>
            <textarea
              name="observations"
              rows={3}
              placeholder="Detalles adicionales del cliente: versión específica, accesorios, urgencia, etc."
              defaultValue={values?.observations ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-[#D6A93D]/60 focus:ring-4 focus:ring-[#D6A93D]/10 placeholder:text-zinc-600 resize-none"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Datos del cliente</CardTitle>
          <CardDescription>Solo visibles para ti y administradores.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Nombre del cliente <span className="text-red-400">*</span></span>
            <Input
              name="customerName"
              required
              placeholder="Nombre completo"
              defaultValue={values?.customerName ?? ""}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Celular <span className="text-red-400">*</span></span>
            <Input
              name="customerPhone"
              required
              type="tel"
              placeholder="3001234567"
              defaultValue={values?.customerPhone ?? ""}
            />
          </label>
        </CardContent>
      </Card>
    </>
  );
}

export function OrderForm() {
  const [state, action, isPending] = useActionState(createOrderAction, { error: null, attempt: 0 });

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <FormFields key={state.attempt} values={state.values} />

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Guardando…" : "Guardar pedido"}
        </Button>
      </div>
    </form>
  );
}
