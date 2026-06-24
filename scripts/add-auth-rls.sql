-- Migracion para aplicar login multiusuario sobre una base existente.
-- Ejecutar en el SQL Editor de Supabase.
-- Importante: los registros existentes con user_id NULL no seran visibles
-- hasta asignarlos manualmente a un usuario de auth.users.

BEGIN;

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE clientes
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE pedidos
  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on clientes" ON clientes;
DROP POLICY IF EXISTS "Allow all operations on pedidos" ON pedidos;
DROP POLICY IF EXISTS "Users can manage own clientes" ON clientes;
DROP POLICY IF EXISTS "Users can manage own pedidos" ON pedidos;

CREATE POLICY "Users can manage own clientes" ON clientes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own pedidos" ON pedidos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM clientes
      WHERE clientes.id = pedidos.cliente_id
        AND clientes.user_id = auth.uid()
    )
  );

COMMIT;

-- Para conservar datos existentes, reemplazar <USER_UUID> por el id del usuario
-- propietario y ejecutar antes de usar la app:
-- UPDATE clientes SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
-- UPDATE pedidos SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
