-- Phase 11: Performance indexes
-- Run in Supabase SQL Editor

-- vehicles: filtro por estado (inventario, alertas)
CREATE INDEX IF NOT EXISTS vehicles_status_created
  ON vehicles(status, created_at DESC);

-- vehicles: búsqueda por marca+línea (filtros de inventario)
CREATE INDEX IF NOT EXISTS vehicles_brand_line
  ON vehicles(brand, line);

-- vehicles: asesores asignados (validación al eliminar asesor)
CREATE INDEX IF NOT EXISTS vehicles_advisor_buyer
  ON vehicles(advisor_buyer_id)
  WHERE advisor_buyer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS vehicles_advisor_seller
  ON vehicles(advisor_seller_id)
  WHERE advisor_seller_id IS NOT NULL;

-- finance_movements: cálculo de costo real por vehículo
CREATE INDEX IF NOT EXISTS finance_movements_vehicle_date
  ON finance_movements(vehicle_id, date DESC)
  WHERE deleted_at IS NULL;

-- finance_movements: balance por canal (dashboard de caja)
CREATE INDEX IF NOT EXISTS finance_movements_channel_date
  ON finance_movements(channel, date DESC)
  WHERE deleted_at IS NULL;

-- commissions: comisiones por asesor y estado (listado + validación borrado)
CREATE INDEX IF NOT EXISTS commissions_advisor_status
  ON commissions(advisor_id, status);

-- sales: ventas por vehículo (detalle de vehículo)
CREATE INDEX IF NOT EXISTS sales_vehicle_id
  ON sales(vehicle_id);

-- sales: ventas activas por estado (separaciones, entregas pendientes)
CREATE INDEX IF NOT EXISTS sales_status_created
  ON sales(sale_status, created_at DESC);

-- customers: búsqueda por nombre
CREATE INDEX IF NOT EXISTS customers_full_name
  ON customers(full_name)
  WHERE deleted_at IS NULL;

-- vehicle_costs: costos por vehículo
-- (ya existe vehicle_costs_vehicle_id_idx de phase2, no duplicar)

-- vehicle_movements: historial por vehículo (timeline)
CREATE INDEX IF NOT EXISTS vehicle_movements_vehicle_created
  ON vehicle_movements(vehicle_id, created_at DESC);

-- audit_logs: consulta por registro auditado
-- (ya existe audit_logs_record_idx de phase2, no duplicar)
