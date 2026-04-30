-- ─────────────────────────────────────────────────────────────
-- Paso 1: Crear el bucket en Supabase Dashboard
-- ─────────────────────────────────────────────────────────────
-- Ve a: Storage → New bucket
-- Nombre: vehicle-photos
-- Tipo: Public (activar "Public bucket")
-- Guardar.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- Paso 2: Ejecutar este SQL en el SQL Editor de Supabase
-- ─────────────────────────────────────────────────────────────

-- Permitir que usuarios autenticados suban fotos
create policy "vehicle_photos_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'vehicle-photos');

-- Permitir que usuarios autenticados eliminen fotos
create policy "vehicle_photos_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'vehicle-photos');

-- La lectura pública la gestiona el bucket (Public bucket = sin policy de select necesaria).
