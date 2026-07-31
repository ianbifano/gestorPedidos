-- Migracion: Agregar campos de control de publicacion a productos.
-- Ejecutar en el SQL Editor de Supabase.

BEGIN;

-- Agregar campo publicado (default true para productos existentes)
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS publicado BOOLEAN NOT NULL DEFAULT true;

-- Agregar campo disponible si no existe (default true)
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS disponible BOOLEAN NOT NULL DEFAULT true;

-- Agregar RLS a productos si no existe
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Política para productos: todos los autenticados pueden ver, solo el dueño del comercio puede modificar
DROP POLICY IF EXISTS "Users can view all products" ON productos;
DROP POLICY IF EXISTS "Users can manage own commerce products" ON productos;

CREATE POLICY "Users can view all products" ON productos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own commerce products" ON productos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = productos.comercio_id
        AND u.email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = productos.comercio_id
        AND u.email = auth.email()
    )
  );

COMMIT;
