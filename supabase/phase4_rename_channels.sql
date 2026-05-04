-- Fase 4: Renombrar canales de efectivo
-- Ejecutar en Supabase SQL Editor

ALTER TYPE finance_channel RENAME VALUE 'Efectivo ubicación 1' TO 'Efectivo José';
ALTER TYPE finance_channel RENAME VALUE 'Efectivo ubicación 2' TO 'Efectivo Tomás';
