-- Phase 10: Structured owner fields for transfer_processes

ALTER TABLE transfer_processes
  ADD COLUMN IF NOT EXISTS from_doc_type  TEXT DEFAULT 'Cédula',
  ADD COLUMN IF NOT EXISTS from_doc_number TEXT,
  ADD COLUMN IF NOT EXISTS from_phone      TEXT,
  ADD COLUMN IF NOT EXISTS from_company    TEXT,
  ADD COLUMN IF NOT EXISTS to_doc_type    TEXT DEFAULT 'Cédula',
  ADD COLUMN IF NOT EXISTS to_doc_number  TEXT,
  ADD COLUMN IF NOT EXISTS to_phone       TEXT,
  ADD COLUMN IF NOT EXISTS to_company     TEXT;
