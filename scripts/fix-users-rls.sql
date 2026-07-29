-- Migración: Agregar políticas RLS a la tabla users
-- La tabla `users` fue creada sin políticas RLS, pero Supabase activa RLS
-- por defecto en tablas nuevas, bloqueando SELECT/INSERT desde el cliente.
-- Ejecutar en SQL Editor de Supabase Dashboard.

BEGIN;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

-- Permitir SELECT a usuarios autenticados (por email)
CREATE POLICY "Users can read own record" ON users
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Permitir INSERT a usuarios autenticados (para crear su registro si no existe)
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = email);

COMMIT;
