export const PAYMENT_CHANNELS = [
  "Banco",
  "Efectivo José",
  "Efectivo Tomás",
] as const;

export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];
