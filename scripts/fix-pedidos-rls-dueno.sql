-- Migración: RLS para pedidos SIN depender de user_id
-- La tabla pedidos NO tiene columna user_id.
-- Relaciones disponibles:
--   pedidos.cliente_id  → clientes.id → clientes.user_id (UUID auth)
--   pedidos.comercio_id → comercios.id → users_x_comercios.comercio_id
--
-- Ejecutar en SQL Editor de Supabase Dashboard

BEGIN;

-- ============================================================
-- Limpiar políticas viejas de pedidos
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own pedidos" ON pedidos;
DROP POLICY IF EXISTS "Allow all operations on pedidos" ON pedidos;
DROP POLICY IF EXISTS "Owners can view pedidos of their commerces" ON pedidos;
DROP POLICY IF EXISTS "Owners can update pedidos of their commerces" ON pedidos;
DROP POLICY IF EXISTS "Owners can delete pedidos of their commerces" ON pedidos;
DROP POLICY IF EXISTS "Clients can view own pedidos" ON pedidos;

-- ============================================================
-- DUEÑOS: SELECT - ver pedidos de sus comercios
-- ============================================================
CREATE POLICY "Owners can view pedidos" ON pedidos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = pedidos.comercio_id
        AND u.email = auth.email()
        AND uxc.rol = 'dueno'
    )
  );

-- ============================================================
-- DUEÑOS: UPDATE - cambiar estado/editar pedidos de sus comercios
-- ============================================================
CREATE POLICY "Owners can update pedidos" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = pedidos.comercio_id
        AND u.email = auth.email()
        AND uxc.rol = 'dueno'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = pedidos.comercio_id
        AND u.email = auth.email()
        AND uxc.rol = 'dueno'
    )
  );

-- ============================================================
-- DUEÑOS: DELETE - eliminar pedidos de sus comercios
-- ============================================================
CREATE POLICY "Owners can delete pedidos" ON pedidos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users_x_comercios uxc
      JOIN users u ON u.user_id = uxc.user_id
      WHERE uxc.comercio_id = pedidos.comercio_id
        AND u.email = auth.email()
        AND uxc.rol = 'dueno'
    )
  );

-- ============================================================
-- CLIENTES: SELECT - ver pedidos vinculados a su registro cliente
-- ============================================================
CREATE POLICY "Clients can view own pedidos" ON pedidos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM clientes c
      WHERE c.id = pedidos.cliente_id
        AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- CLIENTES: INSERT - crear pedidos (cualquier usuario autenticado)
-- ============================================================
CREATE POLICY "Authenticated can insert pedidos" ON pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMIT;
