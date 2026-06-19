export type VehicleStatus =
  | "Disponible"
  | "Separado"
  | "Vendido"
  | "Vendido por el propietario"
  | "En comisión"
  | "En reparación"
  | "En trámite"
  | "Entregado"
  | "Publicado"
  | "No publicado"
  | "Papeles pendientes";

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  line: string;
  version: string;
  year: number;
  mileage: number;
  color: string;
  motor: string;
  transmission: string;
  fuel: string;
  traction: string;
  cityRegistration: string;
  legalStatus: string;
  lienValue?: number;
  status: VehicleStatus;
  location: string;
  ownerType: "Propio" | "Comisión" | "Externo";
  entryType: string;
  buyPrice: number;
  targetPrice: number;
  minPrice: number;
  estimatedCost: number;
  realCost: number;
  advisorBuyer: string;
  advisorSeller?: string;
  soatDue: string;
  technoDue: string;
  published: boolean;
  separated: boolean;
  alert?: string;
  createdAt: string;
  createdByUserId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerContactVisible?: boolean; // false = masked for this viewer (undefined = visible by default)
  commissionRate?: number; // % comisión para vehículos no propios, default 3
  notes?: string;
};

export type VehicleMovement = {
  id: string;
  vehicleId: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  user: string;
  oldPrice?: number;
  newPrice?: number;
};

export type VehiclePhoto = {
  id: string;
  vehicleId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
};
