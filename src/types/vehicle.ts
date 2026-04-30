export type VehicleStatus =
  | "Disponible"
  | "Separado"
  | "Vendido"
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
  status: VehicleStatus;
  location: string;
  ownerType: "Propio" | "Comisión";
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
};

export type VehicleMovement = {
  id: string;
  vehicleId: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  user: string;
};

export type VehiclePhoto = {
  id: string;
  vehicleId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
};
