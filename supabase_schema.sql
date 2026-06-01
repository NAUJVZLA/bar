-- ==============================================================
-- PLAN DE BASE DE DATOS: ALCO-JCCG GASTRO BAR POS (Lógica Multisede)
-- Ejecuta este script en el editor SQL de Supabase para configurar tu Base de Datos remota.
-- ==============================================================

-- 1. EXTENSIONES Y LIMPIEZA (Opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza preventiva
DROP TABLE IF EXISTS creditos CASCADE;
DROP TABLE IF EXISTS prestamos CASCADE;
DROP TABLE IF EXISTS cierres CASCADE;
DROP TABLE IF EXISTS detalle_ventas CASCADE; -- Obsoleta (reemplazada por JSONB en ventas)
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS consumos_mesa CASCADE; -- Obsoleta (reemplazada por JSONB en mesas)
DROP TABLE IF EXISTS mesas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS insumos CASCADE;
DROP TABLE IF EXISTS sedes CASCADE;

-- 2. TABLA SEDES
CREATE TABLE sedes (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    nombre VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA PRODUCTOS (Inventario)
CREATE TABLE productos (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50) DEFAULT 'SIN-CODIGO',
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) DEFAULT 'Varios',
    precio_compra NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    precio_venta NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    stock_actual INTEGER DEFAULT 0 NOT NULL,
    stock_minimo INTEGER DEFAULT 5 NOT NULL,
    tiene_receta BOOLEAN DEFAULT FALSE NOT NULL,
    receta JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.1 TABLA INSUMOS (Inventario de Cocina/Ingredientes)
CREATE TABLE insumos (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    unidad VARCHAR(20) NOT NULL, -- ej: 'g', 'und', 'ml'
    stock_actual NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    stock_minimo NUMERIC(12, 2) DEFAULT 5 NOT NULL,
    costo_unitario NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de consulta rápida por sede
CREATE INDEX idx_productos_sede ON productos(sede_id);
CREATE INDEX idx_productos_codigo ON productos(codigo_barras);
CREATE INDEX idx_insumos_sede ON insumos(sede_id);

-- 4. TABLA MESAS
CREATE TABLE mesas (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    numero_mesa VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'OCUPADA', 'PAGANDO')),
    cliente_nombre VARCHAR(100) DEFAULT '',
    consumos JSONB DEFAULT '[]'::jsonb, -- Ahora los pedidos viven íntegramente en la mesa
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA MOVIMIENTOS (Historial de Inventario)
CREATE TABLE movimientos (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    producto_id VARCHAR(100) NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    producto_nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('INGRESO', 'EGRESO')) NOT NULL,
    cantidad INTEGER NOT NULL,
    motivo VARCHAR(255),
    registrado_por VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA VENTAS
CREATE TABLE ventas (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) DEFAULT 'Cliente General',
    total NUMERIC(12, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'EFECTIVO',
    atendido_por VARCHAR(100) NOT NULL,
    es_directa BOOLEAN DEFAULT FALSE,
    items JSONB DEFAULT '[]'::jsonb, -- Ahora los detalles de venta viven íntegramente en la venta
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA CREDITOS (Fiados)
CREATE TABLE creditos (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) NOT NULL,
    venta_id VARCHAR(100) REFERENCES ventas(id) ON DELETE SET NULL,
    total_deuda NUMERIC(12, 2) NOT NULL,
    total_pagado NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PAGADO')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    registrado_por VARCHAR(100) NOT NULL,
    notas TEXT
);

-- 10. TABLA PRESTAMOS (Botellas vacías)
CREATE TABLE prestamos (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) NOT NULL,
    botella_nombre VARCHAR(150) NOT NULL,
    cantidad INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'DEVUELTO')),
    fecha_prestamo TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_devolucion TIMESTAMP WITH TIME ZONE,
    registrado_por VARCHAR(100) NOT NULL,
    desconto_stock BOOLEAN DEFAULT FALSE,
    producto_id VARCHAR(100) REFERENCES productos(id) ON DELETE SET NULL,
    notas TEXT
);

-- 11. TABLA CIERRES DE CAJA (Arqueo por turno)
CREATE TABLE cierres (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    monto_apertura NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_efectivo NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_tarjeta NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_transferencia NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_credito NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_total NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    monto_real NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    descuadre NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_count INTEGER DEFAULT 0 NOT NULL,
    registrado_por VARCHAR(100) NOT NULL,
    notas TEXT
);

-- ==============================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ==============================================================
-- Habilitamos RLS en todas las tablas
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres ENABLE ROW LEVEL SECURITY;

-- Permisos
CREATE POLICY "Acceso total sedes" ON sedes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total productos" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total insumos" ON insumos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total mesas" ON mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total movimientos" ON movimientos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total ventas" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total creditos" ON creditos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total prestamos" ON prestamos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total cierres" ON cierres FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================
-- SUPABASE REALTIME (WebSockets)
-- Permite que los computadores escuchen cambios en tiempo real
-- ==============================================================
BEGIN;
  -- Borrar publication si existe para evitar errores
  DROP PUBLICATION IF EXISTS supabase_realtime;
  -- Crear publication
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE ventas;
ALTER PUBLICATION supabase_realtime ADD TABLE movimientos;
ALTER PUBLICATION supabase_realtime ADD TABLE productos;
ALTER PUBLICATION supabase_realtime ADD TABLE insumos;

-- Identity Full asegura que se manden todos los datos en el payload (útil para updates)
ALTER TABLE mesas REPLICA IDENTITY FULL;
ALTER TABLE ventas REPLICA IDENTITY FULL;
ALTER TABLE movimientos REPLICA IDENTITY FULL;

-- ==============================================================
-- 12. TABLA REFRIGERIOS (Consumo de Empleados)
-- ==============================================================
CREATE TABLE refrigerios (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sede_id VARCHAR(100) NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    producto_id VARCHAR(100) NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    producto_nombre VARCHAR(200) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    empleado_nombre VARCHAR(150) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas TEXT
);

-- Habilitamos RLS
ALTER TABLE refrigerios ENABLE ROW LEVEL SECURITY;

-- Permisos
CREATE POLICY "Acceso total refrigerios" ON refrigerios FOR ALL USING (true) WITH CHECK (true);

-- Agregar a Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE refrigerios;

-- Replica Identity
ALTER TABLE refrigerios REPLICA IDENTITY FULL;
