-- Phase 12: Unify payments.channel with finance_channel enum values
-- Run in Supabase SQL Editor

-- 1. Rename old channel values (created before phase4 rename)
UPDATE payments SET channel = 'Efectivo José'  WHERE channel = 'Efectivo ubicación 1';
UPDATE payments SET channel = 'Efectivo Tomás' WHERE channel = 'Efectivo ubicación 2';

-- 2. Add check constraint so no future record can use invalid values.
--    Allows: fixed channels + dynamic owner-payment patterns (Efectivo - X, Transferencia - X)
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_channel_check;
ALTER TABLE payments ADD CONSTRAINT payments_channel_check
  CHECK (
    channel IN ('Banco', 'Efectivo José', 'Efectivo Tomás')
    OR channel LIKE 'Efectivo - %'
    OR channel LIKE 'Transferencia - %'
  );
