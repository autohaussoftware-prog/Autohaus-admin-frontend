export const PAYMENT_CHANNELS = [
  "Banco",
  "Efectivo ubicación 1",
  "Efectivo ubicación 2",
] as const;

export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];
