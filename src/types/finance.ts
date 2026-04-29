export type FinanceMovementType = "Ingreso" | "Egreso";
export type FinanceChannel = "Banco" | "Efectivo ubicación 1" | "Efectivo ubicación 2";

export type FinanceMovement = {
  id: string;
  type: FinanceMovementType;
  channel: FinanceChannel;
  category: string;
  concept: string;
  amount: number;
  date: string;
  vehicleId?: string;
  responsible: string;
};

export type Commission = {
  id: string;
  advisor: string;
  role: "Captador" | "Vendedor" | "Crédito";
  vehicle: string;
  amount: number;
  status: "Pendiente" | "Pagada";
  month: string;
};
