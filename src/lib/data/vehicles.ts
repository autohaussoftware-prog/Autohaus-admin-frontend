import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { vehicleMovements as mockVehicleMovements, vehicles as mockVehicles } from "@/data/mock";
import type { Vehicle, VehicleMovement, VehiclePhoto, VehicleStatus } from "@/types/vehicle";

export type VehicleFormOption = {
  id: string;
  name: string;
};

export type CreateVehicleInput = {
  plate: string;
  brand: string;
  line: string;
  version?: string;
  year?: number;
  mileage?: number;
  color?: string;
  motor?: string;
  transmission?: string;
  fuel?: string;
  traction?: string;
  cityRegistration?: string;
  legalStatus?: string;
  lienValue?: number;
  status: VehicleStatus;
  locationId?: string;
  ownerType: Vehicle["ownerType"];
  buyPrice?: number;
  targetPrice?: number;
  minPrice?: number;
  estimatedCost?: number;
  realCost?: number;
  advisorBuyerId?: string;
  advisorSellerId?: string;
  soatDue?: string;
  technoDue?: string;
  entryType?: string;
  published?: boolean;
  separated?: boolean;
  ownerName?: string;
  ownerPhone?: string;
  ownerDocument?: string;
  createdByUserId?: string;
  notes?: string;
};

type DbVehicle = {
  id: string;
  plate: string;
  brand: string;
  line: string;
  version: string | null;
  year: number | null;
  mileage: number | null;
  color: string | null;
  motor: string | null;
  transmission: string | null;
  fuel: string | null;
  traction: string | null;
  city_registration: string | null;
  legal_status: string | null;
  lien_value: number | null;
  status: VehicleStatus;
  location_id: string | null;
  owner_type: Vehicle["ownerType"];
  buy_price: number | string | null;
  target_price: number | string | null;
  min_price: number | string | null;
  estimated_cost: number | string | null;
  real_cost: number | string | null;
  advisor_buyer_id: string | null;
  advisor_seller_id: string | null;
  soat_due: string | null;
  techno_due: string | null;
  published: boolean | null;
  separated: boolean | null;
  alert_summary: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_document: string | null;
  created_by_user_id: string | null;
  created_by: string | null; // existing column in schema, references profiles(id)
  commission_rate: number | string | null;
  notes: string | null;
};

type DbVehicleMovement = {
  id: string;
  vehicle_id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
  metadata: { userName?: string; oldPrice?: number; newPrice?: number } | null;
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string | null | undefined) {
  return value ?? "";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 16).replace("T", " ");
}

function uniqueOptions(names: string[]) {
  return Array.from(new Set(names.filter(Boolean))).map((name) => ({ id: name, name }));
}

async function getReferenceMaps() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { locations: new Map<string, string>(), advisors: new Map<string, string>() };

  const [locationsResult, advisorsResult] = await Promise.all([
    supabase.from("locations").select("id,name"),
    supabase.from("advisors").select("id,full_name"),
  ]);

  return {
    locations: new Map((locationsResult.data ?? []).map((location) => [location.id as string, location.name as string])),
    advisors: new Map((advisorsResult.data ?? []).map((advisor) => [advisor.id as string, advisor.full_name as string])),
  };
}

// Roles that can always see owner contact info regardless of who created the vehicle
const FULL_ACCESS_ROLES = ["owner", "partner", "admin", "gerente", "accounting"];

function mapVehicle(
  vehicle: DbVehicle,
  references: Awaited<ReturnType<typeof getReferenceMaps>>,
  viewer?: { userId: string; role: string }
): Vehicle {
  // Determine if the viewer can see owner contact info
  const creatorId = vehicle.created_by_user_id ?? vehicle.created_by ?? null;
  const canSeeContact = !viewer
    || FULL_ACCESS_ROLES.includes(viewer.role)
    || (creatorId !== null && creatorId === viewer.userId);

  return {
    id: vehicle.id,
    plate: vehicle.plate,
    brand: vehicle.brand,
    line: vehicle.line,
    version: vehicle.version ?? "",
    year: vehicle.year ?? 0,
    mileage: vehicle.mileage ?? 0,
    color: vehicle.color ?? "",
    motor: vehicle.motor ?? "",
    transmission: vehicle.transmission ?? "",
    fuel: vehicle.fuel ?? "",
    traction: vehicle.traction ?? "",
    cityRegistration: vehicle.city_registration ?? "",
    legalStatus: vehicle.legal_status ?? "No",
    lienValue: vehicle.lien_value ?? undefined,
    status: vehicle.status,
    location: vehicle.location_id ? references.locations.get(vehicle.location_id) ?? "Sin ubicación" : "Sin ubicación",
    ownerType: vehicle.owner_type,
    entryType: (vehicle as any).entry_type ?? "Compra",
    buyPrice: toNumber(vehicle.buy_price),
    targetPrice: toNumber(vehicle.target_price),
    minPrice: toNumber(vehicle.min_price),
    estimatedCost: toNumber(vehicle.estimated_cost),
    realCost: toNumber(vehicle.real_cost),
    advisorBuyer: vehicle.advisor_buyer_id ? references.advisors.get(vehicle.advisor_buyer_id) ?? "Sin asignar" : "Sin asignar",
    advisorSeller: vehicle.advisor_seller_id ? references.advisors.get(vehicle.advisor_seller_id) ?? undefined : undefined,
    soatDue: formatDate(vehicle.soat_due),
    technoDue: formatDate(vehicle.techno_due),
    published: Boolean(vehicle.published),
    separated: Boolean(vehicle.separated),
    alert: vehicle.alert_summary ?? undefined,
    createdAt: (vehicle as any).created_at ?? "",
    createdByUserId: vehicle.created_by_user_id ?? vehicle.created_by ?? undefined,
    ownerContactVisible: canSeeContact,
    ownerName: canSeeContact ? (vehicle.owner_name ?? undefined) : undefined,
    ownerPhone: canSeeContact ? (vehicle.owner_phone ?? undefined) : undefined,
    commissionRate: toNumber(vehicle.commission_rate) || 3,
    notes: vehicle.notes ?? undefined,
  };
}

function mapMovement(movement: DbVehicleMovement): VehicleMovement {
  return {
    id: movement.id,
    vehicleId: movement.vehicle_id,
    type: movement.type,
    title: movement.title,
    description: movement.description ?? "",
    createdAt: formatDateTime(movement.created_at),
    user: movement.metadata?.userName ?? "Sistema",
    oldPrice: movement.metadata?.oldPrice,
    newPrice: movement.metadata?.newPrice,
  };
}

const VEHICLES_PAGE_SIZE = 60;

export async function getVehicles(
  viewer?: { userId: string; role: string },
  opts?: { page?: number; pageSize?: number }
): Promise<{ vehicles: Vehicle[]; total: number }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { vehicles: mockVehicles, total: mockVehicles.length };

  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = opts?.pageSize ?? VEHICLES_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const [dataRes, countRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
  ]);

  if (dataRes.error || !dataRes.data) {
    console.error("No se pudieron cargar vehículos desde Supabase:", dataRes.error?.message);
    return { vehicles: mockVehicles, total: mockVehicles.length };
  }

  const references = await getReferenceMaps();
  const vehicles = (dataRes.data as DbVehicle[]).map((v) => mapVehicle(v, references, viewer));
  return { vehicles, total: countRes.count ?? vehicles.length };
}

export async function getVehiclesSummary(): Promise<{
  total: number;
  available: number;
  withAlerts: number;
  totalCapital: number;
}> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      total: mockVehicles.length,
      available: mockVehicles.filter((v) => v.status === "Disponible" || v.status === "Publicado").length,
      withAlerts: mockVehicles.filter((v) => v.alert).length,
      totalCapital: mockVehicles.reduce((s, v) => s + v.buyPrice + v.realCost, 0),
    };
  }

  const { data } = await supabase
    .from("vehicles")
    .select("status, buy_price, real_cost, alert_summary")
    .is("deleted_at", null);

  if (!data) return { total: 0, available: 0, withAlerts: 0, totalCapital: 0 };

  return {
    total: data.length,
    available: data.filter((v) => v.status === "Disponible" || v.status === "Publicado").length,
    withAlerts: data.filter((v) => v.alert_summary).length,
    totalCapital: data
      .filter((v) => !["Vendido", "Entregado"].includes(v.status))
      .reduce((s, v) => s + Number(v.buy_price ?? 0) + Number(v.real_cost ?? 0), 0),
  };
}

export async function getVehicleById(id: string, viewer?: { userId: string; role: string }) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockVehicles.find((vehicle) => vehicle.id === id) ?? null;

  const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).is("deleted_at", null).single();
  if (error || !data) {
    console.error("No se pudo cargar el vehículo desde Supabase:", error?.message);
    return mockVehicles.find((vehicle) => vehicle.id === id) ?? null;
  }

  const references = await getReferenceMaps();
  return mapVehicle(data as DbVehicle, references, viewer);
}

export async function getVehicleMovementsByVehicleId(vehicleId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockVehicleMovements.filter((movement) => movement.vehicleId === vehicleId);

  const { data, error } = await supabase
    .from("vehicle_movements")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("No se pudieron cargar movimientos del vehículo:", error?.message);
    return mockVehicleMovements.filter((movement) => movement.vehicleId === vehicleId);
  }

  return (data as DbVehicleMovement[]).map(mapMovement);
}

export async function getVehicleFormOptions() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      locations: uniqueOptions(mockVehicles.map((vehicle) => vehicle.location)),
      advisors: uniqueOptions(mockVehicles.flatMap((vehicle) => [vehicle.advisorBuyer, vehicle.advisorSeller ?? ""])),
    };
  }

  const [locationsResult, advisorsResult] = await Promise.all([
    supabase.from("locations").select("id,name").eq("active", true).order("name"),
    supabase.from("advisors").select("id,full_name").eq("active", true).order("full_name"),
  ]);

  return {
    locations: (locationsResult.data ?? []).map((location) => ({ id: location.id as string, name: location.name as string })),
    advisors: (advisorsResult.data ?? []).map((advisor) => ({ id: advisor.id as string, name: advisor.full_name as string })),
  };
}

export async function createVehicle(input: CreateVehicleInput) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) {
    throw new Error("Supabase no está configurado. Completa las variables de entorno antes de guardar vehículos reales.");
  }

  const status = input.status;
  const published = input.published ?? status === "Publicado";
  const separated = input.separated ?? status === "Separado";

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      plate: input.plate.trim().toUpperCase(),
      brand: input.brand.trim(),
      line: input.line.trim(),
      version: input.version?.trim() || null,
      year: input.year || null,
      mileage: input.mileage || 0,
      color: input.color?.trim() || null,
      motor: input.motor?.trim() || null,
      transmission: input.transmission?.trim() || null,
      fuel: input.fuel?.trim() || null,
      traction: input.traction?.trim() || null,
      city_registration: input.cityRegistration?.trim() || null,
      legal_status: input.legalStatus?.trim() || "No",
      lien_value: input.lienValue ?? null,
      status,
      location_id: input.locationId || null,
      owner_type: input.ownerType,
      buy_price: input.buyPrice || 0,
      target_price: input.targetPrice || 0,
      min_price: input.minPrice || 0,
      estimated_cost: input.estimatedCost || 0,
      real_cost: input.realCost || 0,
      advisor_buyer_id: input.advisorBuyerId || null,
      advisor_seller_id: input.advisorSellerId || null,
      soat_due: input.soatDue || null,
      techno_due: input.technoDue || null,
      entry_type: input.entryType || "Compra",
      published,
      separated,
      owner_name: input.ownerName?.trim() || null,
      owner_phone: input.ownerPhone?.trim() || null,
      owner_document: input.ownerDocument?.trim() || null,
      created_by: input.createdByUserId || null,
      created_by_user_id: input.createdByUserId || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el vehículo.");
  }

  const vehicleId = data.id as string;
  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: "Ingreso",
    title: "Vehículo ingresado al inventario",
    description: "Registro creado desde formulario Autohaus.",
    new_status: status,
    new_location_id: input.locationId || null,
    metadata: { userName: "Sistema" },
  });

  return vehicleId;
}

export async function updateVehicle(vehicleId: string, input: CreateVehicleInput) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const status = input.status;
  const published = status === "Publicado";
  const separated = status === "Separado";

  const { error } = await supabase
    .from("vehicles")
    .update({
      plate: input.plate.trim().toUpperCase(),
      brand: input.brand.trim(),
      line: input.line.trim(),
      version: input.version?.trim() || null,
      year: input.year || null,
      mileage: input.mileage || 0,
      color: input.color?.trim() || null,
      motor: input.motor?.trim() || null,
      transmission: input.transmission?.trim() || null,
      fuel: input.fuel?.trim() || null,
      traction: input.traction?.trim() || null,
      city_registration: input.cityRegistration?.trim() || null,
      legal_status: input.legalStatus?.trim() || "No",
      lien_value: input.lienValue ?? null,
      status,
      location_id: input.locationId || null,
      owner_type: input.ownerType,
      buy_price: input.buyPrice || 0,
      target_price: input.targetPrice || 0,
      min_price: input.minPrice || 0,
      estimated_cost: input.estimatedCost || 0,
      // real_cost is managed by Supabase trigger (vehicle_costs) — never overwrite here
      advisor_buyer_id: input.advisorBuyerId || null,
      advisor_seller_id: input.advisorSellerId || null,
      soat_due: input.soatDue || null,
      techno_due: input.technoDue || null,
      entry_type: input.entryType || "Compra",
      published,
      separated,
      owner_name: input.ownerName?.trim() || null,
      owner_phone: input.ownerPhone?.trim() || null,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) throw new Error(error.message ?? "No se pudo actualizar el vehículo.");

  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: "Actualización",
    title: "Ficha actualizada",
    description: "Datos del vehículo modificados desde el formulario de edición.",
    new_status: status,
    metadata: { userName: "Sistema" },
  });
}

export async function getVehiclePhotos(vehicleId: string): Promise<VehiclePhoto[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vehicle_documents")
    .select("id,vehicle_id,file_url,file_name,uploaded_at")
    .eq("vehicle_id", vehicleId)
    .eq("document_type", "foto_vehiculo")
    .order("uploaded_at", { ascending: true });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id as string,
    vehicleId: d.vehicle_id as string,
    fileUrl: d.file_url as string,
    fileName: (d.file_name as string) ?? "foto",
    uploadedAt: (d.uploaded_at as string) ?? "",
  }));
}

export async function updateVehicleStatus(vehicleId: string, status: VehicleStatus, responsible: string) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  await supabase.from("vehicles").update({
    status,
    separated: status === "Separado",
    updated_at: new Date().toISOString(),
  }).eq("id", vehicleId);

  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: status,
    title: `Estado actualizado a: ${status}`,
    description: `Cambio de estado registrado por ${responsible}.`,
    new_status: status,
    metadata: { userName: responsible },
  });
}

// Requires: ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 3;
export async function updateVehicleCommissionRate(
  vehicleId: string,
  rate: number,
  updatedBy: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase
    .from("vehicles")
    .update({ commission_rate: rate, updated_at: new Date().toISOString() })
    .eq("id", vehicleId);

  if (error) throw new Error(error.message ?? "No se pudo actualizar la comisión.");

  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: "Actualización",
    title: "Comisión de consignación actualizada",
    description: `Comisión cambiada a ${rate}% por ${updatedBy}.`,
    metadata: { updatedBy, rate, updatedAt: new Date().toISOString() },
  });
}

// Requires columns in Supabase:
// ALTER TABLE vehicles
//   ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ DEFAULT NULL,
//   ADD COLUMN IF NOT EXISTS deleted_by   TEXT        DEFAULT NULL,
//   ADD COLUMN IF NOT EXISTS delete_reason TEXT       DEFAULT NULL;
export async function deleteVehicle(
  vehicleId: string,
  deletedBy: string,
  reason?: string
): Promise<{ softDeleted: boolean }> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  // Check related records (active sales, finance movements)
  const [salesRes, movementsRes] = await Promise.all([
    supabase
      .from("sales")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", vehicleId)
      .neq("status", "Cancelado"),
    supabase
      .from("finance_movements")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", vehicleId)
      .is("deleted_at", null),
  ]);

  const hasRelated = (salesRes.count ?? 0) > 0 || (movementsRes.count ?? 0) > 0;

  if (hasRelated) {
    // Soft delete: keep record but hide it
    const { error } = await supabase
      .from("vehicles")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        delete_reason: reason?.trim() || null,
      })
      .eq("id", vehicleId);
    if (error) throw new Error(error.message ?? "No se pudo eliminar el vehículo.");
    return { softDeleted: true };
  } else {
    // No related records → soft delete anyway for auditability
    const { error } = await supabase
      .from("vehicles")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        delete_reason: reason?.trim() || null,
      })
      .eq("id", vehicleId);
    if (error) throw new Error(error.message ?? "No se pudo eliminar el vehículo.");
    return { softDeleted: false };
  }
}
