-- Migracion: RLS para comercios usando la tabla puente users_x_comercios.
-- Ejecutar en el SQL Editor de Supabase.
-- La relacion user <-> comercio se resuelve via users_x_comercios + users.

BEGIN;

ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on comercios" ON comercios;
DROP POLICY IF EXISTS "Users can manage own comercios" ON comercios;

CREATE POLICY "Users can manage own comercios" ON comercios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = comercios.id
        AND u.email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = comercios.id
        AND u.email = auth.email()
    )
  );

COMMIT;
