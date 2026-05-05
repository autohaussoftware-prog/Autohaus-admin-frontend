import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdvisorStats = {
  vehiclesRegistered: number;
  vehiclesAvailable: number;
  salesTotal: number;
  salesThisMonth: number;
  recentVehicles: {
    id: string;
    plate: string;
    brand: string;
    line: string;
    status: string;
    createdAt: string;
  }[];
  recentSales: {
    id: string;
    vehicleName: string;
    vehiclePlate: string;
    customerName: string | null;
    agreedPrice: number;
    saleStatus: string;
    createdAt: string;
  }[];
};

const EMPTY: AdvisorStats = {
  vehiclesRegistered: 0,
  vehiclesAvailable: 0,
  salesTotal: 0,
  salesThisMonth: 0,
  recentVehicles: [],
  recentSales: [],
};

export async function getAdvisorDashboardData(userId: string): Promise<AdvisorStats> {
  if (!userId) return EMPTY;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return EMPTY;

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const [vehiclesRes, salesRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, plate, brand, line, status, created_at")
      .eq("created_by_user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sales")
      .select("id, vehicle_id, agreed_price, sale_status, created_at, customer_id")
      .eq("created_by_user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const vehicles = vehiclesRes.data ?? [];
  const sales = salesRes.data ?? [];

  const salesThisMonth = sales.filter(
    (s: any) => new Date(s.created_at) >= thisMonthStart
  ).length;

  const customerIds = [...new Set(sales.map((s: any) => s.customer_id).filter(Boolean))];
  const vehicleIds = [...new Set(sales.map((s: any) => s.vehicle_id).filter(Boolean))];

  const [customersRes, saleVehiclesRes] = await Promise.all([
    customerIds.length
      ? supabase.from("customers").select("id, full_name").in("id", customerIds)
      : Promise.resolve({ data: [] }),
    vehicleIds.length
      ? supabase.from("vehicles").select("id, brand, line, plate").in("id", vehicleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const customersMap = new Map((customersRes.data ?? []).map((c: any) => [c.id, c.full_name as string]));
  const saleVehiclesMap = new Map((saleVehiclesRes.data ?? []).map((v: any) => [v.id, v]));

  return {
    vehiclesRegistered: vehicles.length,
    vehiclesAvailable: vehicles.filter((v: any) => v.status === "Disponible").length,
    salesTotal: sales.length,
    salesThisMonth,
    recentVehicles: vehicles.slice(0, 6).map((v: any) => ({
      id: v.id as string,
      plate: v.plate as string,
      brand: v.brand as string,
      line: v.line as string,
      status: v.status as string,
      createdAt: v.created_at as string,
    })),
    recentSales: sales.slice(0, 6).map((s: any) => {
      const v = saleVehiclesMap.get(s.vehicle_id);
      return {
        id: s.id as string,
        vehicleName: v ? `${v.brand} ${v.line}` : "Vehículo",
        vehiclePlate: (v as any)?.plate ?? "",
        customerName: customersMap.get(s.customer_id) ?? null,
        agreedPrice: Number(s.agreed_price),
        saleStatus: s.sale_status as string,
        createdAt: s.created_at as string,
      };
    }),
  };
}
