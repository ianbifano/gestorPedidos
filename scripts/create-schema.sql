-- Script para crear schema en Supabase
-- Ejecutar en SQL Editor de Supabase Dashboard

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
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
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comercio_id BIGINT REFERENCES comercios(id),
  estado BIGINT REFERENCES pedidos_estados(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);

-- Habilitar RLS (Row Level Security) - básico para Fase 1
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (sin auth por ahora)
CREATE POLICY "Allow all operations on clientes" ON clientes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on pedidos" ON pedidos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on pedidos_estados" ON pedidos_estados
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on comercios" ON comercios
  FOR ALL USING (true) WITH CHECK (true);

-- Verificación
SELECT 'Schema creado correctamente' as status;
