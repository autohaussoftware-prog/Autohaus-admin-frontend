-- Fase 3: campos de propietario para vehículos en consignación
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS owner_name  text,
  ADD COLUMN IF NOT EXISTS owner_phone text;
