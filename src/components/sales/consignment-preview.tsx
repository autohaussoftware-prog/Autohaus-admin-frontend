"use client";

import { useState } from "react";
import { PackageSearch, Warehouse } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { buildChannelOptions } from "@/lib/domain/payment-channels-config";

type VehicleOption = {
  id: string;
  label: string;
  ownerType: string;
  targetPrice: number;
  ownerName?: string | null;
};

function fmtCOP(n: number) {
  if (!n) return "$0";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function ConsignmentAwarePricing({
  vehicles,
  advisors,
  commissionRate,
  defaultSellerId = null,
}: {
  vehicles: VehicleOption[];
  advisors: { id: string; name: string }[];
  commissionRate: number;
  defaultSellerId?: string | null;
}) {
  const [vehicleMode, setVehicleMode] = useState<"inventory" | "external">("inventory");
  const [vehicleId, setVehicleId] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [paperwork, setPaperwork] = useState("");
  const [saleStatus, setSaleStatus] = useState("separacion");
  const [paymentMethod, setPaymentMethod] = useState("Contado");
  const [initialPaymentChannel, setInitialPaymentChannel] = useState("Banco");

  const selectedVehicle = vehicleMode === "inventory" ? vehicles.find((v) => v.id === vehicleId) : null;
  const isConsignment = selectedVehicle?.ownerType === "Comisión";
  const price = Number(agreedPrice) || 0;
  const commission = isConsignment && price > 0 ? Math.round(price * commissionRate / 100) : 0;
  const paperworkAmount = Number(paperwork) || 0;
  const ownerPayout = price > 0 ? price - commission - paperworkAmount : 0;
  const channelOptions = buildChannelOptions(isConsignment ? selectedVehicle?.ownerName : null);

  function switchMode(mode: "inventory" | "external") {
    setVehicleMode(mode);
    setVehicleId("");
    setAgreedPrice("");
    setInitialPaymentChannel("Banco");
  }

  return (
    <>
      {/* Vehicle origin toggle */}
      <div className="col-span-full">
        <span className="mb-2 block text-sm text-zinc-400">Origen del vehículo</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchMode("inventory")}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${vehicleMode === "inventory" ? "border-[#D6A93D] bg-[#D6A93D]/10 text-[#D6A93D]" : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}
          >
            <Warehouse className="h-4 w-4" />
            Del inventario
          </button>
          <button
            type="button"
            onClick={() => switchMode("external")}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${vehicleMode === "external" ? "border-rose-700 bg-rose-950/30 text-rose-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}
          >
            <PackageSearch className="h-4 w-4" />
            No registrado
          </button>
        </div>
        <input type="hidden" name="vehicleMode" value={vehicleMode} />
      </div>

      {vehicleMode === "inventory" ? (
        /* ── Inventory vehicle select ── */
        <div className="block">
          <span className="mb-2 block text-sm text-zinc-400">
            Vehículo <span className="text-red-400">*</span>
          </span>
          <Select
            name="vehicleId"
            defaultValue=""
            required
            onChange={(e) => { setVehicleId(e.target.value); setInitialPaymentChannel("Banco"); }}
          >
            <option value="" disabled>Selecciona un vehículo</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </Select>
          {isConsignment && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#D6A93D]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D6A93D]" />
              Vehículo en consignación — comisión del {commissionRate}% automática
            </p>
          )}
        </div>
      ) : (
        /* ── External vehicle form ── */
        <>
          <div className="col-span-full rounded-2xl border border-rose-800/30 bg-rose-950/10 px-4 py-3">
            <p className="text-xs text-rose-300">
              <span className="font-semibold">Vehículo no registrado en inventario.</span> Al confirmar se creará automáticamente con etiqueta <span className="font-medium">Externo</span>.
            </p>
          </div>

          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Placa <span className="text-red-400">*</span>
            </span>
            <Input name="extPlate" required placeholder="Ej: ABC123" style={{ textTransform: "uppercase" }} />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Marca <span className="text-red-400">*</span>
            </span>
            <Input name="extBrand" required placeholder="Ej: TOYOTA" />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Línea <span className="text-red-400">*</span>
            </span>
            <Input name="extLine" required placeholder="Ej: HILUX" />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">Modelo (año)</span>
            <Input name="extYear" type="number" min="1980" max="2030" placeholder={String(new Date().getFullYear())} />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">Kilometraje</span>
            <Input name="extMileage" type="number" min="0" placeholder="Ej: 45000" />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">Color</span>
            <Input name="extColor" placeholder="Ej: Blanco" />
          </div>

          <div className="col-span-full">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Propietario del vehículo</p>
          </div>

          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Nombre <span className="text-red-400">*</span>
            </span>
            <Input name="extOwnerName" required placeholder="Juan García López" />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Celular <span className="text-red-400">*</span>
            </span>
            <Input name="extOwnerPhone" type="tel" required placeholder="3001234567" />
          </div>
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">Cédula / NIT</span>
            <Input name="extOwnerDocument" placeholder="1234567890" />
          </div>

          <input type="hidden" name="vehicleId" value="" />
          <input type="hidden" name="clientPaperworkAmount" value="0" />
        </>
      )}

      {/* Sale type */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Tipo de registro <span className="text-red-400">*</span>
        </span>
        <Select name="saleStatus" defaultValue="separacion" onChange={(e) => setSaleStatus(e.target.value)}>
          <option value="separacion">Separación (con saldo pendiente)</option>
          <option value="vendido">Venta directa (pago completo)</option>
        </Select>
      </div>

      {/* Payment method */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">
          Forma de pago <span className="text-red-400">*</span>
        </span>
        <Select name="paymentMethod" defaultValue="Contado" onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="Contado">Contado</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Mixto">Mixto</option>
          <option value="Crédito">Crédito</option>
        </Select>
      </div>

      {/* Expiry date */}
      {(() => {
        const needsExpiry = saleStatus === "separacion" && paymentMethod !== "Crédito";
        const isCredit = paymentMethod === "Crédito";
        return (
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Fecha límite separación
              {needsExpiry && <span className="text-red-400"> *</span>}
            </span>
            {isCredit ? (
              <>
                <Input name="expiryDate" type="date" defaultValue="" disabled className="opacity-40" />
                <p className="mt-1 text-xs text-blue-400">No aplica para créditos — la fecha se coordinará con la entidad.</p>
              </>
            ) : (
              <Input
                name="expiryDate"
                type="date"
                defaultValue=""
                required={needsExpiry}
                min={new Date().toISOString().split("T")[0]}
                title={needsExpiry ? "Obligatorio para separaciones." : "Solo aplica para separaciones."}
              />
            )}
          </div>
        );
      })()}

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

      {/* Initial payment channel */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">Canal del abono inicial</span>
        <Select
          name="initialPaymentChannel"
          value={initialPaymentChannel}
          onChange={(e) => setInitialPaymentChannel(e.target.value)}
        >
          <optgroup label="Canales de la empresa">
            {channelOptions.filter((c) => !isConsignment || (!c.startsWith("Efectivo -") && !c.startsWith("Transferencia -"))).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          {isConsignment && channelOptions.some((c) => c.startsWith("Efectivo -") || c.startsWith("Transferencia -")) && (
            <optgroup label={`Pago al propietario — ${selectedVehicle?.ownerName ?? ""}`}>
              {channelOptions.filter((c) => c.startsWith("Efectivo -") || c.startsWith("Transferencia -")).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
          )}
        </Select>
      </div>

      {/* Paperwork amount — only for inventory consignment vehicles */}
      {vehicleMode === "inventory" && (
        isConsignment ? (
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400">Valor papeles cliente (COP)</span>
            <Input
              name="clientPaperworkAmount"
              type="number"
              min="0"
              placeholder="Ej: 1500000"
              value={paperwork}
              onChange={(e) => setPaperwork(e.target.value)}
            />
            <p className="mt-1 text-xs text-zinc-500">Valor correspondiente a trámites, traspaso y papeles del cliente.</p>
          </div>
        ) : (
          <input type="hidden" name="clientPaperworkAmount" value="0" />
        )
      )}

      {/* Seller advisor */}
      <div className="block">
        <span className="mb-2 block text-sm text-zinc-400">Asesor vendedor</span>
        <Select name="sellerId" defaultValue={defaultSellerId ?? ""}>
          <option value="">Sin asignar</option>
          {advisors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </div>

      {/* Consignment breakdown — only for inventory consignment vehicles */}
      {vehicleMode === "inventory" && isConsignment && price > 0 && (
        <div className="col-span-full rounded-2xl border border-[#D6A93D]/30 bg-[#D6A93D]/5 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#D6A93D]">
            Liquidación consignación ({commissionRate}%)
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center">
              <p className="text-xs text-zinc-500">Precio de venta</p>
              <p className="mt-1 text-sm font-bold text-white">{fmtCOP(price)}</p>
            </div>
            <div className="rounded-xl border border-[#D6A93D]/40 bg-[#D6A93D]/10 p-3 text-center">
              <p className="text-xs text-[#D6A93D]">Comisión ({commissionRate}%)</p>
              <p className="mt-1 text-sm font-bold text-[#D6A93D]">− {fmtCOP(commission)}</p>
            </div>
            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-3 text-center">
              <p className="text-xs text-zinc-400">Papeles cliente</p>
              <p className="mt-1 text-sm font-bold text-zinc-300">
                {paperworkAmount > 0 ? `− ${fmtCOP(paperworkAmount)}` : "–"}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-center">
              <p className="text-xs text-emerald-400">Para el propietario</p>
              <p className="mt-1 text-sm font-bold text-emerald-400">{fmtCOP(ownerPayout)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
