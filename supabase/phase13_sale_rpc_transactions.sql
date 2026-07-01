-- Phase 13: Atomic sale RPCs using PostgreSQL transactions
-- Run in Supabase SQL Editor
-- Replaces sequential app-layer queries in createSale and cancelSale with
-- single-transaction PL/pgSQL functions. Prevents partial state on failure.

-- Ensure finance_movements has a notes column (used to link movements to sales)
ALTER TABLE finance_movements ADD COLUMN IF NOT EXISTS notes TEXT;

-- ─── create_sale_atomic ──────────────────────────────────────────────────────
-- All business logic (commission amounts, vehicle status) is pre-computed by
-- the caller. This function only writes — atomically.
--
-- Returns the new sale UUID.

CREATE OR REPLACE FUNCTION create_sale_atomic(
  p_vehicle_id               UUID,
  p_customer_name            TEXT,
  p_customer_phone           TEXT,
  p_customer_document        TEXT,
  p_seller_id                UUID,
  p_agreed_price             NUMERIC,
  p_initial_payment          NUMERIC,
  p_pending_balance          NUMERIC,
  p_payment_status           TEXT,
  p_document_status          TEXT,
  p_delivery_status          TEXT,
  p_sale_status              TEXT,
  p_expiry_date              DATE,
  p_payment_method           TEXT,
  p_client_paperwork_amount  NUMERIC,
  p_created_by_user_id       UUID,
  -- Vehicle
  p_vehicle_new_status       TEXT,
  p_vehicle_separated        BOOLEAN,
  -- Vehicle movement
  p_movement_title           TEXT,
  p_movement_description     TEXT,
  -- Finance movement for initial payment (skipped if p_initial_payment = 0)
  p_finance_channel          TEXT,
  p_finance_concept          TEXT,
  -- Advisor commissions for own vehicles [{advisor_id, role, base_amount, percentage, amount, month}]
  p_commissions              JSONB,
  -- Consignment income (owner_type = 'Comisión'); 0 = not applicable
  p_consignment_income_amount  NUMERIC,
  p_consignment_income_concept TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id   UUID;
  v_sale_id       UUID;
  v_category_id   UUID;
  v_commission    JSONB;
BEGIN
  -- 1. Upsert customer
  IF p_customer_name IS NOT NULL AND trim(p_customer_name) <> '' THEN
    SELECT id INTO v_customer_id
    FROM customers
    WHERE lower(full_name) = lower(trim(p_customer_name))
    LIMIT 1;

    IF v_customer_id IS NULL THEN
      INSERT INTO customers (full_name, phone, document_number)
      VALUES (
        trim(p_customer_name),
        NULLIF(trim(COALESCE(p_customer_phone, '')), ''),
        NULLIF(trim(COALESCE(p_customer_document, '')), '')
      )
      RETURNING id INTO v_customer_id;
    END IF;
  END IF;

  -- 2. Insert sale
  INSERT INTO sales (
    vehicle_id, customer_id, seller_id,
    agreed_price, initial_payment, pending_balance,
    payment_status, document_status, delivery_status,
    sale_status, expiry_date, payment_method,
    client_paperwork_amount, created_by_user_id
  ) VALUES (
    p_vehicle_id, v_customer_id, p_seller_id,
    p_agreed_price, p_initial_payment, p_pending_balance,
    p_payment_status, p_document_status, p_delivery_status,
    p_sale_status, p_expiry_date, p_payment_method,
    p_client_paperwork_amount, p_created_by_user_id
  )
  RETURNING id INTO v_sale_id;

  -- 3. Update vehicle status
  UPDATE vehicles
  SET status    = p_vehicle_new_status::vehicle_status,
      separated = p_vehicle_separated
  WHERE id = p_vehicle_id;

  -- 4. Vehicle movement
  INSERT INTO vehicle_movements (vehicle_id, type, title, description, new_status, metadata)
  VALUES (
    p_vehicle_id,
    p_vehicle_new_status,
    p_movement_title,
    p_movement_description,
    p_vehicle_new_status::vehicle_status,
    jsonb_build_object('userName', 'Sistema', 'saleId', v_sale_id::text)
  );

  -- 5. Initial payment finance movement
  IF p_initial_payment > 0 THEN
    INSERT INTO finance_movements (
      type, channel, concept, amount, date,
      vehicle_id, responsible_name, notes
    ) VALUES (
      'Ingreso',
      p_finance_channel::finance_channel,
      p_finance_concept,
      p_initial_payment,
      current_date,
      p_vehicle_id,
      'Sistema',
      'Venta ID: ' || v_sale_id::text || '.'
    );
  END IF;

  -- 6a. Consignment commission income (owner_type = 'Comisión')
  IF p_consignment_income_amount > 0 THEN
    -- Upsert the category to avoid race conditions
    INSERT INTO finance_categories (name, affects_vehicle_cost)
    VALUES ('Consignaciones', false)
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO v_category_id FROM finance_categories WHERE name = 'Consignaciones';

    INSERT INTO finance_movements (
      type, channel, concept, amount, date,
      vehicle_id, responsible_name, category_id, notes
    ) VALUES (
      'Ingreso',
      'Banco'::finance_channel,
      p_consignment_income_concept,
      p_consignment_income_amount,
      current_date,
      p_vehicle_id,
      'Sistema',
      v_category_id,
      'Venta ID: ' || v_sale_id::text || '.'
    );

    UPDATE sales
    SET commission_amount      = p_consignment_income_amount,
        commission_auto_amount = p_consignment_income_amount
    WHERE id = v_sale_id;
  END IF;

  -- 6b. Advisor commissions (own vehicles)
  IF p_commissions IS NOT NULL AND jsonb_array_length(p_commissions) > 0 THEN
    FOR v_commission IN SELECT * FROM jsonb_array_elements(p_commissions)
    LOOP
      INSERT INTO commissions (
        advisor_id, role, vehicle_id, sale_id,
        base_amount, percentage, amount, status, month
      ) VALUES (
        (v_commission->>'advisor_id')::UUID,
        v_commission->>'role',
        p_vehicle_id,
        v_sale_id,
        (v_commission->>'base_amount')::NUMERIC,
        (v_commission->>'percentage')::NUMERIC,
        (v_commission->>'amount')::NUMERIC,
        'Pendiente',
        v_commission->>'month'
      );
    END LOOP;
  END IF;

  RETURN v_sale_id;
END;
$$;


-- ─── cancel_sale_atomic ──────────────────────────────────────────────────────
-- Atomically cancels a sale. Fetches all needed data from DB internally.
-- p_delete_initial_payment = true  → also removes linked finance_movements
-- External vehicles (owner_type = 'Externo') are deleted, not restored.

CREATE OR REPLACE FUNCTION cancel_sale_atomic(
  p_sale_id                UUID,
  p_cancelled_by           TEXT,
  p_delete_initial_payment BOOLEAN,
  p_reason                 TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id  UUID;
  v_is_external BOOLEAN;
  v_description TEXT;
BEGIN
  -- 1. Fetch sale → get vehicle_id
  SELECT vehicle_id INTO v_vehicle_id
  FROM sales
  WHERE id = p_sale_id;

  IF v_vehicle_id IS NULL THEN
    RAISE EXCEPTION 'Venta no encontrada: %', p_sale_id;
  END IF;

  -- 2. Check if vehicle is external
  SELECT (owner_type::text = 'Externo') INTO v_is_external
  FROM vehicles
  WHERE id = v_vehicle_id;

  -- 3. Delete child records
  DELETE FROM traspasos   WHERE sale_id = p_sale_id;
  DELETE FROM payments    WHERE sale_id = p_sale_id;
  DELETE FROM commissions WHERE sale_id = p_sale_id;

  -- 4. Optionally delete linked finance movements
  IF p_delete_initial_payment THEN
    DELETE FROM finance_movements
    WHERE notes ILIKE '%' || p_sale_id::text || '%';
  END IF;

  -- 5. Log vehicle movement before deleting sale
  v_description := 'Venta cancelada por ' || p_cancelled_by || '.';
  IF p_reason IS NOT NULL AND trim(p_reason) <> '' THEN
    v_description := v_description || ' Motivo: ' || trim(p_reason) || '.';
  END IF;
  v_description := v_description ||
    CASE WHEN p_delete_initial_payment
         THEN ' Abono inicial eliminado.'
         ELSE ' Abono inicial conservado.'
    END;

  INSERT INTO vehicle_movements (vehicle_id, type, title, description, new_status, metadata)
  VALUES (
    v_vehicle_id,
    'Disponible',
    'Venta cancelada — vehículo liberado',
    v_description,
    'Disponible'::vehicle_status,
    jsonb_build_object(
      'cancelledBy',           p_cancelled_by,
      'saleId',                p_sale_id::text,
      'deleteInitialPayment',  p_delete_initial_payment,
      'reason',                COALESCE(p_reason, '')
    )
  );

  -- 6. Delete sale
  DELETE FROM sales WHERE id = p_sale_id;

  -- 7. Restore or remove vehicle
  IF v_is_external THEN
    DELETE FROM vehicles WHERE id = v_vehicle_id;
  ELSE
    UPDATE vehicles
    SET status    = 'Disponible'::vehicle_status,
        separated = false
    WHERE id = v_vehicle_id;
  END IF;
END;
$$;
