export const BASE_PAYMENT_CHANNELS = [
  "Banco",
  "Efectivo José",
  "Efectivo Tomás",
] as const;

export type PaymentChannel = (typeof BASE_PAYMENT_CHANNELS)[number];

export const PAYMENT_CHANNELS = BASE_PAYMENT_CHANNELS;

export function buildChannelOptions(ownerName?: string | null): string[] {
  const options: string[] = [...BASE_PAYMENT_CHANNELS];
  if (ownerName?.trim()) {
    options.push(`Efectivo - ${ownerName.trim()}`);
    options.push(`Transferencia - ${ownerName.trim()}`);
  }
  return options;
}
