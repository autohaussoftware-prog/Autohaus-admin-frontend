-- Autohaus Admin — seed inicial desde src/data/mock.ts.
-- Ejecutar después de supabase/schema.sql para validar UI con datos reales.

insert into locations (id, name, type, active) values
('10000000-0000-0000-0000-000000000001', 'Showroom principal', 'vehiculo', true),
('10000000-0000-0000-0000-000000000002', 'Sala de entrega', 'vehiculo', true),
('10000000-0000-0000-0000-000000000003', 'Gestoría', 'vehiculo', true),
('10000000-0000-0000-0000-000000000004', 'Taller aliado', 'vehiculo', true),
('10000000-0000-0000-0000-000000000005', 'Entregado', 'vehiculo', true),
('10000000-0000-0000-0000-000000000006', 'Efectivo ubicación 1', 'caja', true),
('10000000-0000-0000-0000-000000000007', 'Efectivo ubicación 2', 'caja', true)
on conflict (id) do update set name = excluded.name, type = excluded.type, active = excluded.active;

insert into advisors (id, full_name, role, active) values
('20000000-0000-0000-0000-000000000001', 'Sebastián R.', 'Captador', true),
('20000000-0000-0000-0000-000000000002', 'Daniel M.', 'Captador', true),
('20000000-0000-0000-0000-000000000003', 'Mateo C.', 'Captador', true),
('20000000-0000-0000-0000-000000000004', 'Luis G.', 'Vendedor', true),
('20000000-0000-0000-0000-000000000005', 'Camila P.', 'Vendedor', true),
('20000000-0000-0000-0000-000000000006', 'Aliado crédito', 'Crédito', true)
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, active = excluded.active;

insert into finance_categories (id, name, affects_vehicle_cost, active) values
('30000000-0000-0000-0000-000000000001', 'Venta de vehículo', false, true),
('30000000-0000-0000-0000-000000000002', 'Separación / abono', false, true),
('30000000-0000-0000-0000-000000000003', 'Compra de vehículo', true, true),
('30000000-0000-0000-0000-000000000004', 'Reparación', true, true),
('30000000-0000-0000-0000-000000000005', 'Trámite', true, true),
('30000000-0000-0000-0000-000000000006', 'Comisión', true, true),
('30000000-0000-0000-0000-000000000007', 'Transporte', true, true),
('30000000-0000-0000-0000-000000000008', 'Detailing / alistamiento', true, true),
('30000000-0000-0000-0000-000000000009', 'Publicidad', true, true),
('30000000-0000-0000-0000-000000000010', 'Gasto administrativo', false, true),
('30000000-0000-0000-0000-000000000011', 'Otro', false, true)
on conflict (id) do update set name = excluded.name, affects_vehicle_cost = excluded.affects_vehicle_cost, active = excluded.active;

insert into vehicles (
  id, plate, brand, line, version, year, mileage, color, motor, transmission, fuel, traction,
  city_registration, legal_status, status, location_id, owner_type, buy_price, target_price,
  min_price, estimated_cost, real_cost, advisor_buyer_id, advisor_seller_id, soat_due,
  techno_due, published, separated, alert_summary, created_at
) values
('40000000-0000-0000-0000-000000000001', 'KMQ918', 'BMW', 'X6', 'xDrive40i M Sport', 2022, 28500, 'Negro', '3.0L TwinPower Turbo 340 hp', 'Automática', 'Gasolina', 'AWD', 'Medellín', 'Sin restricciones', 'Disponible', '10000000-0000-0000-0000-000000000001', 'Propio', 315000000, 369000000, 354000000, 14500000, 12200000, '20000000-0000-0000-0000-000000000001', null, '2026-10-14', '2026-11-02', true, false, null, '2026-04-25 09:42:00-05'),
('40000000-0000-0000-0000-000000000002', 'JTW442', 'Mercedes-Benz', 'GLE 450', '4MATIC AMG Line', 2021, 41300, 'Blanco diamante', '3.0L EQ Boost 367 hp', 'Automática', 'Híbrido suave', 'AWD', 'Bogotá', 'Sin restricciones', 'Separado', '10000000-0000-0000-0000-000000000002', 'Comisión', 278000000, 329000000, 316000000, 9600000, 10800000, '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '2026-06-18', '2026-06-18', false, true, 'Separado con saldo pendiente', '2026-04-24 10:00:00-05'),
('40000000-0000-0000-0000-000000000003', 'LPA704', 'Porsche', 'Macan S', 'Sport Chrono', 2020, 50200, 'Gris volcano', '3.0L V6 Biturbo 354 hp', 'PDK', 'Gasolina', 'AWD', 'Medellín', 'Trámite en curso', 'En trámite', '10000000-0000-0000-0000-000000000003', 'Propio', 238000000, 286000000, 274000000, 11200000, 13500000, '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '2026-05-23', '2026-08-12', false, false, 'Papeles pendientes', '2026-04-23 10:00:00-05'),
('40000000-0000-0000-0000-000000000004', 'MZD119', 'Toyota', 'Prado TXL', 'Diesel 7 puestos', 2023, 18900, 'Perlado', '3.0L 4 cil. Diesel 163 hp', 'Automática', 'Diesel', '4x4', 'Medellín', 'Sin restricciones', 'Publicado', '10000000-0000-0000-0000-000000000001', 'Propio', 262000000, 299000000, 291000000, 8200000, 9200000, '20000000-0000-0000-0000-000000000001', null, '2026-09-01', '2026-09-01', true, false, 'Margen bajo', '2026-04-22 10:00:00-05'),
('40000000-0000-0000-0000-000000000005', 'HQR550', 'Audi', 'Q8', 'S-Line Quattro', 2022, 33600, 'Azul navarra', '3.0L TFSI V6 340 hp', 'Automática', 'Gasolina', 'AWD', 'Bogotá', 'Sin restricciones', 'En reparación', '10000000-0000-0000-0000-000000000004', 'Comisión', 338000000, 398000000, 382000000, 14600000, 21300000, '20000000-0000-0000-0000-000000000002', null, '2026-12-20', '2026-12-20', false, false, 'Costo no previsto alto', '2026-04-21 10:00:00-05'),
('40000000-0000-0000-0000-000000000006', 'NZX321', 'Land Rover', 'Range Rover Sport', 'HSE Dynamic', 2021, 39100, 'Negro santorini', '3.0L P400 MHEV 400 hp', 'Automática', 'Gasolina', 'AWD', 'Medellín', 'Sin restricciones', 'Vendido', '10000000-0000-0000-0000-000000000005', 'Propio', 356000000, 421000000, 405000000, 12100000, 11800000, '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '2027-01-14', '2027-01-14', false, false, null, '2026-04-20 10:00:00-05')
on conflict (id) do update set
  plate = excluded.plate,
  brand = excluded.brand,
  line = excluded.line,
  version = excluded.version,
  year = excluded.year,
  mileage = excluded.mileage,
  color = excluded.color,
  motor = excluded.motor,
  transmission = excluded.transmission,
  fuel = excluded.fuel,
  traction = excluded.traction,
  city_registration = excluded.city_registration,
  legal_status = excluded.legal_status,
  status = excluded.status,
  location_id = excluded.location_id,
  owner_type = excluded.owner_type,
  buy_price = excluded.buy_price,
  target_price = excluded.target_price,
  min_price = excluded.min_price,
  estimated_cost = excluded.estimated_cost,
  real_cost = excluded.real_cost,
  advisor_buyer_id = excluded.advisor_buyer_id,
  advisor_seller_id = excluded.advisor_seller_id,
  soat_due = excluded.soat_due,
  techno_due = excluded.techno_due,
  published = excluded.published,
  separated = excluded.separated,
  alert_summary = excluded.alert_summary;

insert into vehicle_movements (id, vehicle_id, type, title, description, metadata, created_at) values
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Ingreso', 'Vehículo ingresado al inventario', 'Compra registrada con peritaje aprobado y fotos iniciales cargadas.', '{"userName":"Dueño principal"}', '2026-04-25 09:42:00-05'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Publicación', 'Publicado en canales digitales', 'Se activó publicación en Instagram, WhatsApp Business y página web.', '{"userName":"Socio comercial"}', '2026-04-26 16:12:00-05'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Costo', 'Lavado premium y detailing', 'Costo asociado por preparación estética antes de publicación.', '{"userName":"Administrador"}', '2026-04-27 11:20:00-05'),
('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', 'Separación', 'Separación registrada', 'Cliente abonó $30M. Queda saldo pendiente antes de entrega.', '{"userName":"Asesor vendedor"}', '2026-04-28 14:55:00-05')
on conflict (id) do update set title = excluded.title, description = excluded.description, metadata = excluded.metadata;

insert into finance_movements (id, type, channel, category_id, concept, amount, date, vehicle_id, responsible_name) values
('60000000-0000-0000-0000-000000000001', 'Ingreso', 'Banco', '30000000-0000-0000-0000-000000000001', 'Abono Mercedes-Benz GLE 450', 30000000, '2026-04-28', '40000000-0000-0000-0000-000000000002', 'Luis G.'),
('60000000-0000-0000-0000-000000000002', 'Egreso', 'Banco', '30000000-0000-0000-0000-000000000004', 'Correctivo Audi Q8', 12800000, '2026-04-27', '40000000-0000-0000-0000-000000000005', 'Socio operativo'),
('60000000-0000-0000-0000-000000000003', 'Ingreso', 'Efectivo ubicación 1', '30000000-0000-0000-0000-000000000001', 'Pago parcial Range Rover Sport', 42000000, '2026-04-24', '40000000-0000-0000-0000-000000000006', 'Dueño principal'),
('60000000-0000-0000-0000-000000000004', 'Egreso', 'Efectivo ubicación 2', '30000000-0000-0000-0000-000000000005', 'Gestoría Porsche Macan S', 3600000, '2026-04-26', '40000000-0000-0000-0000-000000000003', 'Administrador'),
('60000000-0000-0000-0000-000000000005', 'Egreso', 'Banco', '30000000-0000-0000-0000-000000000006', 'Comisión captador Prado TXL', 7400000, '2026-04-22', '40000000-0000-0000-0000-000000000004', 'Socio financiero')
on conflict (id) do update set concept = excluded.concept, amount = excluded.amount, responsible_name = excluded.responsible_name;

insert into commissions (id, advisor_id, role, vehicle_id, base_amount, percentage, amount, status, month) values
('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Captador', '40000000-0000-0000-0000-000000000002', 51000000, 20, 10200000, 'Pendiente', 'Abril'),
('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'Vendedor', '40000000-0000-0000-0000-000000000002', 51000000, 20, 10200000, 'Pendiente', 'Abril'),
('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Captador', '40000000-0000-0000-0000-000000000006', 65000000, 20, 13000000, 'Pagada', 'Abril'),
('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'Vendedor', '40000000-0000-0000-0000-000000000003', 48000000, 20, 9600000, 'Pendiente', 'Abril'),
('70000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'Crédito', '40000000-0000-0000-0000-000000000004', 25454545, 33, 8400000, 'Pendiente', 'Abril')
on conflict (id) do update set amount = excluded.amount, status = excluded.status, month = excluded.month;

insert into alerts (id, module, title, description, priority, status, vehicle_id) values
('80000000-0000-0000-0000-000000000001', 'Ventas', 'Mercedes-Benz GLE separado sin pago completo', 'Saldo pendiente de $48M antes de entrega.', 'Alta', 'abierta', '40000000-0000-0000-0000-000000000002'),
('80000000-0000-0000-0000-000000000002', 'Rentabilidad', 'Toyota Prado TXL con margen bajo', 'Margen neto estimado inferior al mínimo esperado.', 'Media', 'abierta', '40000000-0000-0000-0000-000000000004'),
('80000000-0000-0000-0000-000000000003', 'Trámites', 'Porsche Macan con papeles pendientes', 'Trámite abierto después de separación comercial.', 'Alta', 'abierta', '40000000-0000-0000-0000-000000000003'),
('80000000-0000-0000-0000-000000000004', 'Efectivo', 'Movimiento de efectivo grande', 'Egreso en ubicación 2 requiere validación del socio financiero.', 'Media', 'abierta', null),
('80000000-0000-0000-0000-000000000005', 'Costos', 'Audi Q8 con costo no previsto', 'Reparación superó el costo estimado en más de 35%.', 'Alta', 'abierta', '40000000-0000-0000-0000-000000000005')
on conflict (id) do update set title = excluded.title, description = excluded.description, priority = excluded.priority, status = excluded.status;

