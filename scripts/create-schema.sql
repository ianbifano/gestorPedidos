-- Script para crear schema en Supabase
-- Ejecutar en SQL Editor de Supabase Dashboard

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de comercios
CREATE TABLE IF NOT EXISTS comercios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estados de pedido
CREATE TABLE IF NOT EXISTS pedidos_estados (
  id BIGSERIAL PRIMARY KEY,
  estado TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar estados
INSERT INTO pedidos_estados (id, estado) VALUES
  (1, 'Pendiente'),
  (2, 'En Preparacion'),
  (3, 'Demorado'),
  (4, 'Cancelado'),
  (5, 'En Camino'),
  (6, 'Entregado')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado;

SELECT setval('pedidos_estados_id_seq', 6);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comercio_id BIGINT REFERENCES comercios(id),
  estado BIGINT REFERENCES pedidos_estados(id)
);

-- Compatibilidad si el script se ejecuta sobre tablas creadas antes de auth
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE clientes
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE pedidos
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Allow all operations on pedidos_estados" ON pedidos_estados
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on comercios" ON comercios
  FOR ALL USING (true) WITH CHECK (true);

-- Verificación
SELECT 'Schema creado correctamente' as status;
