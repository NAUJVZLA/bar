-- ==============================================================
-- PLAN DE BASE DE DATOS: ALCO-JCCG GASTRO BAR POS (Lógica Multisede)
-- Ejecuta este script en el editor SQL de Supabase para configurar tu Base de Datos remota.
-- ==============================================================

-- 1. EXTENSIONES Y LIMPIEZA (Opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza preventiva
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS consumos_mesa CASCADE;
DROP TABLE IF EXISTS mesas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS sedes CASCADE;

-- 2. TABLA SEDES
CREATE TABLE sedes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA PRODUCTOS (Inventario)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50) DEFAULT 'SIN-CODIGO',
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) DEFAULT 'Varios',
    precio_compra NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    precio_venta NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    stock_actual INTEGER DEFAULT 0 NOT NULL,
    stock_minimo INTEGER DEFAULT 5 NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de consulta rápida por sede
CREATE INDEX idx_productos_sede ON productos(sede_id);
CREATE INDEX idx_productos_codigo ON productos(codigo_barras);

-- 4. TABLA MESAS
CREATE TABLE mesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    numero_mesa VARCHAR(50) NOT NULL,
    estado VARCHAR(30) DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'OCUPADA', 'PAGANDO')) NOT NULL,
    cliente_nombre VARCHAR(100) DEFAULT '',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_mesas_sede ON mesas(sede_id);

-- 5. TABLA CONSUMOS_MESA (Pedidos / Comandas acumuladas)
CREATE TABLE consumos_mesa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0) NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    registrado_por VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_consumos_mesa ON consumos_mesa(mesa_id);

-- 6. TABLA MOVIMIENTOS (Historial de Auditoría / Kárdex)
CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    producto_nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('INGRESO', 'EGRESO')) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    motivo TEXT NOT NULL,
    registrado_por VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_movimientos_sede ON movimientos(sede_id);
CREATE INDEX idx_movimientos_producto ON movimientos(producto_id);

-- 7. TABLA VENTAS (Facturación / Historial de Caja)
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) DEFAULT 'Cliente General' NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    metodo_pago VARCHAR(40) CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')) NOT NULL,
    atendido_por VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_ventas_sede ON ventas(sede_id);

-- 8. TABLA DETALLE_VENTAS (Auditoría desagregada de la Venta)
CREATE TABLE detalle_ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_detalle_ventas_padre ON detalle_ventas(venta_id);

-- ==============================================================
-- 9. CONFIGURACIÓN DE SEGURIDAD RLS (Row Level Security)
-- ==============================================================
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumos_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;

-- Nota: Puedes crear políticas específicas basadas en el rol o JWT de Supabase
-- Por ejemplo, permitir lectura/escritura a usuarios autenticados:
CREATE POLICY "Permitir todo a usuarios autenticados en sedes" 
ON sedes FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir todo a usuarios autenticados en productos" 
ON productos FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir todo a usuarios autenticados en mesas" 
ON mesas FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir todo a usuarios autenticados en consumos" 
ON consumos_mesa FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir todo a usuarios autenticados en movimientos" 
ON movimientos FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir todo a usuarios autenticados en ventas" 
ON ventas FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir todo a usuarios autenticados en detalle_ventas" 
ON detalle_ventas FOR ALL TO authenticated USING (true);


-- ==============================================================
-- 10. VALORES DE DEMOSTRACIÓN (Para poblar base de datos limpia)
-- ==============================================================

-- Inyectar Sedes de prueba
INSERT INTO sedes (id, nombre, direccion) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Licorera & Bar ALCO-JCCG Norte', 'Av. Principal #102'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ALCO-JCCG Express Centro', 'Calle 15 #5-40');

-- Inyectar Productos Sede Norte
INSERT INTO productos (sede_id, codigo_barras, nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '770123456781', 'Cerveza Club Colombia Dorada', 'Cervezas', 3500, 6000, 48, 15),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '770123456782', 'Cerveza Corona Extra 355ml', 'Cervezas', 5000, 9000, 72, 24),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '770123456783', 'Cerveza Aguila Light Botella', 'Cervezas', 2800, 4500, 120, 30),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '770123456784', 'Whisky Johnnie Walker Black Label 700ml', 'Licores', 110000, 165000, 12, 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '770123456785', 'Aguardiente Antioqueño Azul 750ml', 'Licores', 42000, 68000, 24, 8),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '770123456787', 'Gaseosa Coca-Cola 1.5L', 'Gaseosas', 4000, 7000, 30, 10);

-- Inyectar Productos Sede Centro
INSERT INTO productos (sede_id, codigo_barras, nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '770123456782', 'Cerveza Corona Extra 355ml', 'Cervezas', 5000, 8500, 8, 20),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '770123456784', 'Whisky Johnnie Walker Black Label 700ml', 'Licores', 110000, 160000, 4, 5),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '770123456785', 'Aguardiente Antioqueño Azul 750ml', 'Licores', 42000, 65000, 18, 8),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '770123456787', 'Gaseosa Coca-Cola 1.5L', 'Gaseosas', 4000, 6500, 14, 10);

-- Inyectar Mesas de prueba
INSERT INTO mesas (sede_id, numero_mesa, estado) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 1', 'DISPONIBLE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 2', 'DISPONIBLE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 3', 'DISPONIBLE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 4', 'DISPONIBLE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 5', 'DISPONIBLE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Barra Asientos', 'DISPONIBLE'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Mesa 1', 'DISPONIBLE'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Mesa 2', 'DISPONIBLE');
