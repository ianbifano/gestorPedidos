-- ============================================================
-- DIAGNÓSTICO: Ejecutar estas queries y compartir los resultados
-- ============================================================

-- 1. Verificar que los pedidos existen
SELECT id, cliente_id, comercio_id, estado
FROM pedidos
WHERE id IN (22, 23);

-- 2. Verificar el cliente_id=8 tiene user_id correcto
SELECT id, user_id, nombre
FROM clientes
WHERE id = 8;

-- 3. Verificar vinculación dueño-comercio para comercio_id=8
SELECT uxc.user_id, uxc.comercio_id, uxc.rol, u.email
FROM users_x_comercios uxc
JOIN users u ON u.user_id = uxc.user_id
WHERE uxc.comercio_id = 8;

-- 4. Verificar qué usuario está logueado (auth)
SELECT auth.uid() as mi_uuid, auth.email() as mi_email;

-- 5. Ver todas las políticas activas en pedidos
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'pedidos';
