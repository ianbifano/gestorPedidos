-- Migración: Agregar relación Cliente -> Comercio
-- Ejecutar en SQL Editor de Supabase Dashboard

-- 1. Agregar columna comercio_id a la tabla clientes
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS comercio_id BIGINT REFERENCES comercios(id) ON DELETE SET NULL;

-- 2. Índice para queries por comercio
CREATE INDEX IF NOT EXISTS idx_clientes_comercio ON clientes(comercio_id);

-- 3. Política RLS: permitir a dueños ver clientes de sus comercios
DROP POLICY IF EXISTS "Owners can view clients of their commerces" ON clientes;
CREATE POLICY "Owners can view clients of their commerces" ON clientes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR comercio_id IN (
      SELECT uxc.comercio_id
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE u.email = auth.email()
        AND uxc.rol = 'dueno'
    )
  );

-- Verificación
SELECT 'Migración add-cliente-comercio ejecutada correctamente' as status;
