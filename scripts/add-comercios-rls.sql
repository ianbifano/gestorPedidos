-- Migracion: ABM de comercio con aislamiento multi-tenant real.
-- Ejecutar en el SQL Editor de Supabase.
-- Importante: los comercios existentes con user_id NULL no seran visibles
-- hasta asignarlos manualmente a un usuario de auth.users.

BEGIN;

ALTER TABLE comercios
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE comercios
  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_comercios_user ON comercios(user_id);

ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on comercios" ON comercios;
DROP POLICY IF EXISTS "Users can manage own comercios" ON comercios;

CREATE POLICY "Users can manage own comercios" ON comercios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Para conservar comercios existentes, reemplazar <USER_UUID> por el id del
-- usuario dueño y ejecutar antes de usar la app:
-- UPDATE comercios SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
