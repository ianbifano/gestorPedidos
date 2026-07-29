-- Migración: Índices de performance para separación de consultas
-- store_id / comercio_id queries y user_id queries
-- Ejecutar en SQL Editor de Supabase Dashboard

BEGIN;

-- Índice para consultas del vendedor: SELECT * FROM pedidos WHERE comercio_id = [ID]
CREATE INDEX IF NOT EXISTS idx_pedidos_comercio ON pedidos(comercio_id);

-- Índice compuesto para consultas del vendedor filtradas: WHERE comercio_id = [ID] AND estado = [STATUS]
CREATE INDEX IF NOT EXISTS idx_pedidos_comercio_estado ON pedidos(comercio_id, estado);

-- Índice para consultas del cliente: WHERE user_id = [UUID]
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON pedidos(user_id);

-- Índice para filtrado por estado en dashboard
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);

-- Índice para el join con clientes en consultas de cliente
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);

COMMIT;
