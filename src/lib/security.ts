import type { UserRole } from "@/types/auth";

// ─── Role permission sets (single source of truth) ───────────────────────────

export const ROLES = {
  ALL_STAFF: ["owner", "partner", "admin", "gerente", "advisor", "accounting"] as UserRole[],
  FINANCE: ["owner", "partner", "admin", "gerente", "accounting"] as UserRole[],
  MANAGEMENT: ["owner", "partner", "admin", "gerente"] as UserRole[],
  ADMIN_ONLY: ["owner", "partner", "admin"] as UserRole[],
  OWNER_ADMIN: ["owner", "admin"] as UserRole[],
  // Financial write operations — not advisors (they don't record their own payments)
  FINANCE_WRITE: ["owner", "partner", "admin", "gerente", "accounting"] as UserRole[],
  // Vehicle content: advisors can add costs/docs for vehicles they manage
  VEHICLE_WRITE: ["owner", "partner", "admin", "gerente", "advisor", "accounting"] as UserRole[],
  VEHICLE_DELETE: ["owner", "partner", "admin"] as UserRole[],
  COMMISSION_CREATE: ["owner", "partner", "admin", "gerente"] as UserRole[],
  COMMISSION_PAY: ["owner", "partner", "admin", "accounting"] as UserRole[],
} as const;

// ─── Input sanitization ───────────────────────────────────────────────────────

/**
 * Escape PostgREST ilike wildcards to prevent query manipulation and ReDoS.
 * Characters %, _, and \ have special meaning in LIKE patterns.
 */
export function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

/**
 * Escape HTML entities to prevent XSS in email templates and rendered content.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── UUID validation ──────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

// ─── Permission helpers ───────────────────────────────────────────────────────

export function hasRole(role: UserRole, allowed: readonly UserRole[]): boolean {
  return (allowed as UserRole[]).includes(role);
}

export function requireRole(
  role: UserRole,
  allowed: readonly UserRole[],
  message = "Sin permisos para realizar esta acción."
): { error: string } | null {
  if (!hasRole(role, allowed)) return { error: message };
  return null;
}

// ─── Colombian plate validation ───────────────────────────────────────────────

const PLATE_REGEX = /^[A-Z]{3}[-]?\d{3,4}[A-Z]?$/i;

export function isValidPlate(plate: string): boolean {
  return PLATE_REGEX.test(plate.trim());
}

// ─── Financial bounds validation ──────────────────────────────────────────────

export function validateFinancialAmount(
  amount: number,
  label = "El monto"
): string | null {
  if (!Number.isFinite(amount)) return `${label} debe ser un número válido.`;
  if (amount < 0) return `${label} no puede ser negativo.`;
  if (amount > 10_000_000_000) return `${label} excede el límite permitido.`;
  return null;
}

export function validateCommissionRate(rate: number): string | null {
  if (!Number.isFinite(rate)) return "La tasa de comisión debe ser un número válido.";
  if (rate < 0 || rate > 100) return "La tasa de comisión debe estar entre 0 y 100.";
  return null;
}

// ─── Email validation ─────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function filterValidEmails(emails: (string | null | undefined)[]): string[] {
  return emails.filter((e): e is string => Boolean(e) && isValidEmail(e));
}
