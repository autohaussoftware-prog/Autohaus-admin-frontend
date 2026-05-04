"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  BRAND_NAMES,
  getLinesForBrand,
  getSpecsForLine,
  getVersionsForLine,
  normalizeTransmission,
} from "@/data/car-catalog";
import { getColorsForBrand } from "@/data/vehicle-colors";

type Props = {
  defaultBrand?: string;
  defaultLine?: string;
  defaultVersion?: string;
  defaultMotor?: string;
  defaultFuel?: string;
  defaultTransmission?: string;
  defaultTraction?: string;
  defaultColor?: string;
};

const OTHER = "__other__";

export function VehicleIdentificationFields({
  defaultBrand = "",
  defaultLine = "",
  defaultVersion = "",
  defaultMotor = "",
  defaultFuel = "",
  defaultTransmission = "",
  defaultTraction = "",
  defaultColor = "",
}: Props) {
  const knownBrand = BRAND_NAMES.includes(defaultBrand);
  const [selectedBrand, setSelectedBrand] = useState(knownBrand ? defaultBrand : defaultBrand ? OTHER : "");
  const [customBrand, setCustomBrand] = useState(knownBrand ? "" : defaultBrand);

  const activeBrand = selectedBrand === OTHER ? customBrand : selectedBrand;
  const lines = getLinesForBrand(activeBrand);
  const knownLine = lines.includes(defaultLine);
  const [selectedLine, setSelectedLine] = useState(knownLine ? defaultLine : defaultLine ? OTHER : "");
  const [customLine, setCustomLine] = useState(knownLine ? "" : defaultLine);

  const activeLine = selectedLine === OTHER ? customLine : selectedLine;
  const versions = getVersionsForLine(activeBrand, activeLine);
  const colors = getColorsForBrand(activeBrand);

  const [motor, setMotor] = useState(defaultMotor);
  const [fuel, setFuel] = useState(defaultFuel);

  const initTransmission = (): "Manual" | "Automática" | "" => {
    if (defaultTransmission === "Manual" || defaultTransmission === "Automática") return defaultTransmission;
    if (!defaultTransmission) return "";
    return normalizeTransmission(defaultTransmission);
  };
  const [transmission, setTransmission] = useState<"Manual" | "Automática" | "">(initTransmission);
  const [traction, setTraction] = useState(defaultTraction);

  const initColor = (): string => {
    if (!defaultColor) return "";
    const knownColor = colors.find((c) => c.name === defaultColor);
    return knownColor ? defaultColor : OTHER;
  };
  const [selectedColor, setSelectedColor] = useState<string>(initColor);
  const [customColor, setCustomColor] = useState(selectedColor === OTHER ? defaultColor : "");

  function handleBrandChange(value: string) {
    setSelectedBrand(value);
    setCustomBrand("");
    setSelectedLine("");
    setCustomLine("");
    setMotor("");
    setFuel("");
    setTransmission("");
    setTraction("");
    setSelectedColor("");
    setCustomColor("");
  }

  function handleLineChange(value: string) {
    setSelectedLine(value);
    setCustomLine("");
    if (value && value !== OTHER) {
      const specs = getSpecsForLine(activeBrand, value);
      if (specs) {
        setMotor(specs.motor);
        setFuel(specs.fuel);
        setTransmission(normalizeTransmission(specs.transmission));
        setTraction(specs.traction);
      }
    }
    setSelectedColor("");
    setCustomColor("");
  }

  const activeColorName = selectedColor === OTHER ? customColor : selectedColor;

  return (
    <>
      {/* ── Marca ───────────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Marca <span className="text-red-400">*</span></span>
        <Select
          name={selectedBrand === OTHER ? undefined : "brand"}
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          required={selectedBrand !== OTHER}
        >
          <option value="" disabled>Selecciona marca</option>
          {BRAND_NAMES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
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

      {/* ── Línea ───────────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Línea <span className="text-red-400">*</span></span>
        {lines.length > 0 ? (
          <Select
            name={selectedLine === OTHER ? undefined : "line"}
            value={selectedLine}
            onChange={(e) => handleLineChange(e.target.value)}
            required={selectedLine !== OTHER}
          >
            <option value="" disabled>Selecciona línea</option>
            {lines.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
            <option value={OTHER}>Otra línea…</option>
          </Select>
        ) : (
          <Input
            name={selectedLine === OTHER ? undefined : "line"}
            required={selectedLine !== OTHER}
            placeholder="Ej: X6, Cayenne, Land Cruiser…"
            value={activeLine}
            onChange={(e) => {
              setSelectedLine(OTHER);
              setCustomLine(e.target.value);
            }}
          />
        )}
      </label>

      {selectedLine === OTHER && lines.length > 0 && (
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Línea (escribir) <span className="text-red-400">*</span></span>
          <Input
            name="line"
            required
            placeholder="Escribe la línea exacta"
            value={customLine}
            onChange={(e) => setCustomLine(e.target.value)}
          />
        </label>
      )}

      {/* ── Versión ─────────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Versión</span>
        {versions.length > 0 ? (
          <>
            <Input
              name="version"
              placeholder="Selecciona o escribe la versión"
              defaultValue={defaultVersion}
              list="version-suggestions"
            />
            <datalist id="version-suggestions">
              {versions.map((v) => <option key={v} value={v} />)}
            </datalist>
          </>
        ) : (
          <Input
            name="version"
            placeholder="Ej: xDrive40i M Sport, GT500…"
            defaultValue={defaultVersion}
          />
        )}
      </label>

      {/* ── Motor ───────────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Motor</span>
        <Input
          name="motor"
          placeholder="Ej: 3.0L TwinPower Turbo"
          value={motor}
          onChange={(e) => setMotor(e.target.value)}
        />
      </label>

      {/* ── Transmisión (exclusiva: Manual o Automática) ─────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Transmisión <span className="text-red-400">*</span>
        </span>
        <Select
          name="transmission"
          value={transmission}
          onChange={(e) => setTransmission(e.target.value as "Manual" | "Automática" | "")}
          required
        >
          <option value="" disabled>Selecciona transmisión</option>
          <option value="Manual">Manual</option>
          <option value="Automática">Automática</option>
        </Select>
        {!transmission && (
          <p className="mt-1 text-xs text-zinc-500">Selecciona Manual o Automática.</p>
        )}
      </label>

      {/* ── Combustible ─────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Combustible</span>
        <Select name="fuel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
          <option value="">Selecciona o deja en blanco</option>
          <option value="Gasolina">Gasolina</option>
          <option value="Diésel">Diésel</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Eléctrico">Eléctrico</option>
          <option value="Gas natural">Gas natural</option>
        </Select>
      </label>

      {/* ── Tracción ────────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Tracción</span>
        <Select name="traction" value={traction} onChange={(e) => setTraction(e.target.value)}>
          <option value="">Selecciona o deja en blanco</option>
          <option value="FWD">FWD (delantera)</option>
          <option value="RWD">RWD (trasera)</option>
          <option value="AWD">AWD (automática)</option>
          <option value="4WD">4WD (4x4 manual)</option>
          <option value="xDrive AWD">xDrive AWD (BMW)</option>
          <option value="quattro AWD">quattro AWD (Audi)</option>
          <option value="4MATIC AWD">4MATIC AWD (Mercedes)</option>
          <option value="4MOTION AWD">4MOTION AWD (VW)</option>
          <option value="Symmetrical AWD">Symmetrical AWD (Subaru)</option>
          <option value="S-AWC AWD">S-AWC AWD (Mitsubishi)</option>
        </Select>
      </label>

      {/* ── Color (dinámico por marca) ───────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Color</span>
        {!activeBrand ? (
          <Select name="color" disabled value="">
            <option value="" disabled>Selecciona marca primero</option>
          </Select>
        ) : (
          <Select
            name={selectedColor === OTHER ? undefined : "color"}
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              if (e.target.value !== OTHER) setCustomColor("");
            }}
          >
            <option value="">Selecciona color</option>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value={OTHER}>Otro color…</option>
          </Select>
        )}
        <input type="hidden" name="color" value={activeColorName} />
      </label>

      {selectedColor === OTHER && (
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Color (escribir)</span>
          <Input
            placeholder="Ej: Gris carbono metálico"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
          />
        </label>
      )}
    </>
  );
}
