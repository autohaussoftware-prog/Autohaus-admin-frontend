# Blueprint de entrada de datos Autohaus

Este frontend ya tiene claro que quiere mostrar: inventario, fichas de vehículos, ventas, banco, efectivo, comisiones, reportes y alertas. Lo que falta definir es la fuente de verdad: cómo entra la información una sola vez, queda validada, y luego alimenta todas las pantallas.

## Principio central

La app no debe depender de que cada pantalla pida datos separados. Debe existir una base operativa única:

1. Se registra un vehículo una vez.
2. Todo cambio importante se registra como un movimiento del vehículo.
3. Todo dinero se registra como movimiento financiero.
4. Ventas, separaciones, comisiones, alertas y reportes se calculan o derivan de esos registros.

Así el usuario no "rellena el dashboard"; solo registra operaciones reales y el dashboard se arma solo.

## Entrada de datos recomendada

### 0. Ingreso inteligente por documentos

El flujo principal no debe partir de una consulta al RUNT por ahora. Debe partir de los documentos reales que el equipo ya recibe en el proceso comercial:

- Tarjeta de propiedad / licencia de tránsito
- SOAT
- Revisión tecnomecánica
- Peritaje
- Fotos del vehículo, si aplica

La experiencia ideal es:

1. El usuario toca `Nuevo vehículo`.
2. La app le pide subir o tomar fotos de los documentos disponibles.
3. La IA lee cada documento, detecta el tipo y extrae los campos.
4. La app muestra una pantalla de revisión con campos prellenados y resaltados por nivel de confianza.
5. El usuario corrige lo necesario y completa los datos de negocio.
6. Al guardar, la app crea el vehículo, adjunta los documentos, deja auditoría de la extracción y genera movimientos/alertas iniciales.

Datos que puede extraer la IA por documento:

Tarjeta de propiedad / licencia de tránsito:

- Placa
- Marca
- Línea
- Modelo/año
- Color
- Clase de vehículo
- Tipo de servicio
- Número de motor
- Número de chasis
- VIN o serie
- Cilindraje
- Tipo de combustible
- Fecha de matrícula
- Organismo de tránsito
- Propietario, si el documento lo muestra y si la política interna permite guardarlo

SOAT:

- Placa
- Número de póliza
- Aseguradora
- Fecha de inicio
- Fecha de vencimiento
- Tomador/propietario, si aplica
- Datos básicos del vehículo que aparezcan en el certificado

Revisión tecnomecánica:

- Placa
- Número de certificado
- CDA o entidad
- Fecha de expedición
- Fecha de vencimiento
- Resultado
- Kilometraje, si aparece

Peritaje:

- Placa
- Fecha del peritaje
- Entidad o perito
- Kilometraje reportado
- Estado mecánico
- Estado de latonería/pintura
- Observaciones críticas
- Recomendaciones
- Costos estimados de reparación, si aparecen
- Concepto general: aprobado, condicionado o rechazado

Campos que todavía debe confirmar una persona:

- Precio de compra
- Precio objetivo
- Precio mínimo autorizado
- Tipo de origen: `Propio` o `Comisión`
- Ubicación
- Asesor captador
- Estado inicial
- Publicación inicial
- Observaciones comerciales internas

Regla de producto:

- La IA propone datos; el usuario confirma.
- Ningún dato legal o financiero debe quedar como definitivo sin revisión.
- Todo campo extraído debe guardar su fuente: documento, página/foto y confianza.

### 1. Formulario: nuevo vehículo

Este formulario debe ser la versión manual o de revisión del ingreso inteligente. Debe ser rápido y por pasos, porque cargar un carro completo en una sola pantalla puede volverse pesado.

Paso 1: Documentos

- Subir o tomar foto de tarjeta de propiedad
- Subir o tomar foto de SOAT
- Subir o tomar foto de tecnomecánica
- Subir o tomar foto de peritaje
- Ver estado de lectura IA: pendiente, leído, necesita revisión

Paso 2: Identificación

- Placa
- Marca
- Línea
- Versión
- Año
- Kilometraje
- Color
- Ciudad de matrícula

Paso 3: Especificaciones

- Motor
- Número de motor
- Número de chasis
- VIN o serie
- Cilindraje
- Transmisión
- Combustible
- Tracción

Paso 4: Negocio

- Tipo de origen: `Propio` o `Comisión`
- Precio de compra o valor base
- Precio objetivo de venta
- Precio mínimo autorizado
- Asesor captador
- Ubicación actual
- Estado inicial

Paso 5: Documentos y publicación

- Vencimiento SOAT
- Vencimiento tecnomecánica
- Estado legal
- Publicado: sí/no
- Fotos del vehículo
- Peritaje adjunto
- Soportes/documentos adjuntos

Resultado:

- Crea el vehículo.
- Crea un movimiento operativo tipo `Ingreso`.
- Calcula margen inicial.
- Guarda los documentos originales.
- Guarda la extracción IA y las correcciones humanas.
- Genera alertas automáticas si hay papeles pendientes, margen bajo, vencimientos cercanos o lectura con baja confianza.

### 2. Formulario: movimiento de vehículo

Sirve para no editar manualmente la ficha cada vez. Cada evento queda en historial.

Tipos sugeridos:

- Ingreso
- Publicación
- Costo
- Reparación
- Trámite
- Separación
- Venta
- Entrega
- Cambio de ubicación
- Cambio de estado
- Nota interna

Campos:

- Vehículo
- Tipo de movimiento
- Título
- Descripción
- Fecha
- Responsable
- Nuevo estado, si aplica
- Nueva ubicación, si aplica
- Archivo soporte, si aplica

Resultado:

- Alimenta la línea de tiempo de la ficha.
- Puede actualizar estado, ubicación, publicación o alerta del vehículo.

### 3. Formulario: movimiento financiero

Todo ingreso o egreso debe entrar por acá, sin importar si es banco o efectivo.

Campos:

- Tipo: `Ingreso` o `Egreso`
- Canal: `Banco`, `Efectivo ubicación 1`, `Efectivo ubicación 2`
- Categoría
- Concepto
- Monto
- Fecha
- Vehículo asociado, opcional pero recomendado
- Responsable
- Soporte
- Validado por, si requiere aprobación

Categorías sugeridas:

- Venta de vehículo
- Separación / abono
- Compra de vehículo
- Reparación
- Trámite
- Comisión
- Transporte
- Detailing / alistamiento
- Publicidad
- Gasto administrativo
- Otro

Resultado:

- Alimenta `/banco`, `/efectivo`, dashboard y reportes.
- Suma costos reales del vehículo cuando la categoría sea costo asociado.
- Genera alerta cuando hay egresos grandes, movimientos sin soporte o diferencias de caja.

### 4. Formulario: separación o venta

Este debe sentirse como un flujo comercial, no como contabilidad.

Campos:

- Vehículo
- Cliente
- Asesor vendedor
- Precio acordado
- Abono inicial
- Saldo pendiente
- Medio de pago
- Fecha estimada de pago total
- Estado documental
- Estado de entrega

Resultado:

- Cambia el vehículo a `Separado` o `Vendido`.
- Crea movimiento operativo.
- Crea movimiento financiero si hay abono.
- Genera alerta si queda saldo pendiente antes de entrega.
- Calcula comisiones pendientes si hay reglas configuradas.

### 5. Formulario: comisión

Puede ser manual al principio, pero idealmente debe generarse desde una venta.

Campos:

- Asesor
- Rol: captador, vendedor o crédito
- Vehículo
- Base de cálculo
- Porcentaje/regla aplicada
- Monto
- Estado: pendiente o pagada
- Mes
- Movimiento financiero de pago, si aplica

Resultado:

- Alimenta `/comisiones`.
- Cuando se paga, crea egreso financiero categoría `Comisión`.

### 6. Formularios administrativos

Estos son catálogos que simplifican la entrada de datos y evitan errores de escritura.

- Usuarios
- Roles/permisos
- Asesores
- Ubicaciones
- Categorías financieras
- Reglas de comisión
- Reglas de alertas
- Canales de publicación

## Modelo de datos mínimo

### vehicles

Fuente de verdad del inventario.

- id
- plate
- brand
- line
- version
- year
- mileage
- color
- motor
- engine_number
- chassis_number
- vin
- displacement
- transmission
- fuel
- traction
- vehicle_class
- service_type
- city_registration
- registration_date
- transit_authority
- legal_status
- status
- location_id
- owner_type
- buy_price
- target_price
- min_price
- estimated_cost
- real_cost
- advisor_buyer_id
- advisor_seller_id
- soat_policy_number
- soat_insurer
- soat_due
- rtm_certificate_number
- rtm_entity
- techno_due
- inspection_summary
- ai_review_status
- published
- separated
- alert_summary
- created_at
- updated_at

### vehicle_documents

Archivos originales que alimentan el ingreso inteligente.

- id
- vehicle_id
- document_type: tarjeta_propiedad, soat, tecnomecanica, peritaje, foto_vehiculo, otro
- file_url
- file_name
- mime_type
- uploaded_by
- uploaded_at
- status: pendiente, procesado, requiere_revision, rechazado
- notes

### ai_extractions

Resultados crudos y revisados de la lectura con IA/OCR.

- id
- vehicle_id
- document_id
- provider
- model
- extracted_fields
- field_confidence
- raw_text
- raw_response
- review_status: pendiente, aprobado, corregido, rechazado
- reviewed_by
- reviewed_at
- created_at

Ejemplo de `extracted_fields`:

```json
{
  "plate": "KMQ918",
  "brand": "BMW",
  "line": "X6",
  "year": 2022,
  "color": "NEGRO",
  "vin": "WBAXXXXX",
  "soat_due": "2026-10-14"
}
```

Ejemplo de `field_confidence`:

```json
{
  "plate": 0.98,
  "brand": 0.94,
  "vin": 0.71,
  "soat_due": 0.91
}
```

### vehicle_movements

Historial operativo.

- id
- vehicle_id
- type
- title
- description
- created_at
- user_id
- metadata

### finance_movements

Registro único de dinero.

- id
- type
- channel
- category_id
- concept
- amount
- date
- vehicle_id
- responsible_id
- support_file_url
- approved_by
- approved_at
- created_at

### sales

Separaciones y ventas.

- id
- vehicle_id
- customer_id
- seller_id
- agreed_price
- initial_payment
- pending_balance
- payment_status
- document_status
- delivery_status
- sale_status
- created_at
- closed_at

### commissions

Comisiones generadas o manuales.

- id
- advisor_id
- role
- vehicle_id
- sale_id
- base_amount
- percentage
- amount
- status
- month
- paid_finance_movement_id

### alerts

Alertas generadas por reglas.

- id
- module
- title
- description
- priority
- status
- vehicle_id
- finance_movement_id
- document_id
- extraction_id
- created_at
- resolved_at
- resolved_by

## Qué se autollena con IA

- Datos básicos del vehículo desde tarjeta de propiedad.
- Fechas y póliza desde SOAT.
- Vencimiento y resultado desde tecnomecánica.
- Kilometraje, observaciones y costos sugeridos desde peritaje.
- Estado documental inicial.
- Alertas por documentos faltantes, vencidos o con baja confianza de lectura.

## Qué se calcula automáticamente

- Capital en inventario = suma de precio de compra + costos reales.
- Utilidad proyectada = precio objetivo - compra - costos reales.
- Margen neto = utilidad proyectada / precio objetivo.
- Saldo banco = ingresos banco - egresos banco.
- Saldo efectivo por ubicación = ingresos - egresos de cada ubicación.
- Costos reales del vehículo = egresos asociados al vehículo en categorías de costo.
- Alertas por margen bajo.
- Alertas por vencimientos de SOAT/tecnomecánica.
- Alertas por saldo pendiente en ventas separadas.
- Alertas por egresos grandes o movimientos sin soporte.
- Alertas por documento ilegible, dato crítico sin confirmar o inconsistencia entre documentos.

## Prioridad de implementación

### Fase 1: ingreso inteligente usable

1. Crear backend/base de datos.
2. Crear storage para documentos.
3. Implementar pantalla `Nuevo vehículo` con carga/toma de fotos.
4. Implementar extracción IA/OCR para tarjeta de propiedad, SOAT, tecnomecánica y peritaje.
5. Implementar pantalla de revisión y corrección antes de guardar.
6. Guardar vehículo, documentos, extracción y auditoría.
7. Conectar `/inventario` y `/vehiculos` a `vehicles`.
8. Reemplazar `src/data/mock.ts` por funciones de lectura reales.

### Fase 2: operaciones completas

1. Agregar movimientos de vehículo.
2. Implementar formulario `Nuevo movimiento financiero`.
3. Asociar movimientos financieros a vehículos.
4. Agregar separaciones/ventas.
5. Calcular costos reales automáticamente.
6. Generar alertas básicas.

### Fase 3: control y automatización

1. Reglas de comisión configurables.
2. Aprobaciones para egresos grandes.
3. Carga de soportes.
4. Reportes por periodo.
5. Permisos por rol.
6. Integraciones externas futuras si se decide consultar fuentes oficiales o proveedores.

## Recomendación técnica

Para este proyecto conviene usar Supabase porque ya encaja con el estado actual del frontend:

- Postgres para datos relacionales.
- Auth para usuarios.
- Storage para fotos, peritajes y soportes.
- Row Level Security para permisos.
- API automática para leer/escribir desde Next.js.

La capa de IA debe ser un servicio separado del frontend:

- El frontend sube documentos a storage.
- El backend llama al modelo de visión/OCR.
- El backend guarda la respuesta en `ai_extractions`.
- El usuario revisa y confirma en pantalla.
- Solo después se crea o actualiza el vehículo definitivo.

Para la primera versión no se necesita consultar RUNT. La fuente inicial será la lectura de documentos internos del proceso y la validación humana.

Alternativa simple si se quiere validar muy rápido: Google Sheets o Airtable como base temporal. Sirve para prototipo, pero no es ideal para permisos, soportes, auditoría ni finanzas.

## Cambios directos necesarios en el frontend

Actualmente las pantallas importan desde `src/data/mock.ts`. El cambio sano es crear una capa de datos:

- `src/lib/data/vehicles.ts`
- `src/lib/data/documents.ts`
- `src/lib/data/extractions.ts`
- `src/lib/data/finance.ts`
- `src/lib/data/sales.ts`
- `src/lib/data/commissions.ts`
- `src/lib/data/alerts.ts`

Primero esas funciones pueden devolver mocks. Después se cambian internamente para consultar Supabase sin reescribir todas las pantallas.

Ejemplo de intención:

```ts
const vehicles = await getVehicles();
const vehicle = await getVehicleById(id);
const movements = await getVehicleMovements(id);
const documents = await getVehicleDocuments(id);
const extraction = await getLatestVehicleExtraction(id);
const financeMovements = await getFinanceMovements();
```

También se deben crear componentes de ingreso inteligente:

- `DocumentUploadStep`
- `ExtractionReviewStep`
- `VehicleBusinessStep`
- `DocumentConfidenceBadge`
- `ExtractedField`

## Decisión de producto

La entrada de datos no debe ser un formulario enorme para "llenar la app". Debe ser una serie de acciones naturales del negocio:

- Se subieron documentos de un vehículo.
- La IA leyó y propuso datos.
- Una persona revisó y confirmó.
- Entró un vehículo.
- Se hizo un gasto.
- Se recibió un pago.
- Se separó una unidad.
- Se vendió.
- Se pagó una comisión.
- Se cambió un estado.

Cada acción debe guardar la información mínima necesaria y el resto de la app debe actualizarse sola.
