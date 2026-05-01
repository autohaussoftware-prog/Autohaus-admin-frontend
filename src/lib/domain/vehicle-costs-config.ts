export const COST_CATEGORIES = [
  "Mecánica",
  "Lavado",
  "Pintura",
  "Tapicería",
  "Vidrios",
  "Eléctrico",
  "Trámites",
  "Transporte",
  "Publicidad",
  "Parqueadero",
  "Comisión captador",
  "Otro",
] as const;

export type CostCategory = (typeof COST_CATEGORIES)[number];
