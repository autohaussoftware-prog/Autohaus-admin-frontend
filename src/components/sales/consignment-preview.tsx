"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type VehicleOption = {
  id: string;
  label: string;
  ownerType: string;
  targetPrice: number;
};

function fmtCOP(n: number) {
  if (!n) return "$0";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function ConsignmentAwarePricing({
  vehicles,
  advisors,
  commissionRate,
}: {
  vehicles: VehicleOption[];
  advisors: { id: string; name: string }[];
  commissionRate: number;
}) {
  const [vehicleId, setVehicleId] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const isConsignment = selectedVehicle?.ownerType === "Comisión";
  const price = Number(agreedPrice) || 0;
  const commission = isConsignment && price > 0 ? Math.round(price * commissionRate / 100) : 0;
  const ownerPayout = price > 0 ? price - commission : 0;

  return (
    <>
      {/* Vehicle select */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Vehículo <span className="text-red-400">*</span>
        </span>
        <Select
          name="vehicleId"
          defaultValue=""
          required
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <option value="" disabled>Selecciona un vehículo</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </Select>
        {isConsignment && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#D6A93D]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D6A93D]" />
            Vehículo en consignación — se aplica {commissionRate}% de comisión sobre el precio de venta
          </p>
        )}
      </div>

      {/* Saleype */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Tipo de registro <span className="text-red-400">*</span>
        </span>
        <Select name="saleStatus" defaultValue="separacion">
          <option value="separacion">Separación (con saldo pendiente)</option>
          <option value="vendido">Venta directa (pago completo)</option>
        </Select>
      </div>

      {/* Expiry */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">Fecha límite separación</span>
        <Input
          name="expiryDate"
          type="date"
          defaultValue=""
          title="Solo aplica para separaciones."
        />
      </div>

      {/* Agreed price */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Precio acordado (COP) <span className="text-red-400">*</span>
        </span>
        <Input
          name="agreedPrice"
          type="number"
          min="0"
          required
          placeholder="Ej: 350000000"
          value={agreedPrice}
          onChange={(e) => setAgreedPrice(e.target.value)}
        />
      </div>

      {/* Initial payment */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">Abono inicial (COP)</span>
        <Input name="initialPayment" type="number" min="0" defaultValue="0" placeholder="0" />
      </div>

      {/* Seller advisor */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">Asesor vendedor</span>
        <Select name="sellerId" defaultValue="">
          <option value="">Sin asignar</option>
          {advisors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </div>

      {/* Consignment preview */}
      {isConsignment && price > 0 && (
        <div className="col-span-full rounded-2xl border border-[#D6A93D]/30 bg-[#D6A93D]/5 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#D6A93D]">
            Liquidación consignación ({commissionRate}%)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center">
              <p className="text-xs text-zinc-500">Precio de venta</p>
              <p className="mt-1 text-base font-bold text-white">{fmtCOP(price)}</p>
            </div>
            <div className="rounded-xl border border-[#D6A93D]/40 bg-[#D6A93D]/10 p-3 text-center">
              <p className="text-xs text-[#D6A93D]">Comisión Autohaus</p>
              <p className="mt-1 text-base font-bold text-[#D6A93D]">{fmtCOP(commission)}</p>
              <p className="text-xs text-zinc-500">{commissionRate}%</p>
            </div>
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-center">
              <p className="text-xs text-emerald-400">Para el propietario</p>
              <p className="mt-1 text-base font-bold text-emerald-400">{fmtCOP(ownerPayout)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
