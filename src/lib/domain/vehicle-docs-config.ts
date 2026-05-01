export const LEGAL_DOC_TYPES = [
  "SOAT",
  "Tecnomecánica",
  "Tarjeta de propiedad",
  "Factura de compra",
  "Contrato de compraventa",
  "Poder de venta",
  "Registro de traspaso",
  "Paz y salvo comparendos",
  "Otro",
] as const;

export type LegalDocType = (typeof LEGAL_DOC_TYPES)[number];
