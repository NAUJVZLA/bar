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

-- 9. TABLA CREDITOS (Cartera de Deudas)
CREATE TABLE creditos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) NOT NULL,
    venta_id UUID REFERENCES ventas(id) ON DELETE SET NULL,
    total_deuda NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    total_pagado NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PAGADO')) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    registrado_por VARCHAR(100) NOT NULL,
    notas TEXT
);

CREATE INDEX idx_creditos_sede ON creditos(sede_id);

-- 10. TABLA PRESTAMOS (Préstamos de Envases / Botellas)
CREATE TABLE prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) NOT NULL,
    botella_nombre VARCHAR(150) NOT NULL,
    cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0) NOT NULL,
    estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'DEVUELTO')) NOT NULL,
    fecha_prestamo TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_devolucion TIMESTAMP WITH TIME ZONE,
    registrado_por VARCHAR(100) NOT NULL,
    descontó_stock BOOLEAN DEFAULT FALSE NOT NULL,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    notas TEXT
);

CREATE INDEX idx_prestamos_sede ON prestamos(sede_id);

-- 11. TABLA CIERRES (Arqueo / Cierres de Caja)
CREATE TABLE cierres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    monto_apertura NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_efectivo NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_tarjeta NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_transferencia NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_credito NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    ventas_total NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    monto_real NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    descuadre NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    registrado_por VARCHAR(100) NOT NULL,
    notas TEXT,
    ventas_count INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX idx_cierres_sede ON cierres(sede_id);

-- ==============================================================
-- 12. CONFIGURACIÓN DE SEGURIDAD RLS (Row Level Security)
-- ==============================================================
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumos_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura a usuarios autenticados:
CREATE POLICY "Permitir todo a usuarios autenticados en sedes" ON sedes FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en productos" ON productos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en mesas" ON mesas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en consumos" ON consumos_mesa FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en movimientos" ON movimientos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en ventas" ON ventas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en detalle_ventas" ON detalle_ventas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en creditos" ON creditos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en prestamos" ON prestamos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en cierres" ON cierres FOR ALL TO authenticated USING (true);

-- Permisos públicos iniciales (opcional para desarrollo sin auth estricto)
CREATE POLICY "Permitir lectura publica en sedes" ON sedes FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en productos" ON productos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en mesas" ON mesas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en consumos" ON consumos_mesa FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en movimientos" ON movimientos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en ventas" ON ventas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en detalle_ventas" ON detalle_ventas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en creditos" ON creditos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en prestamos" ON prestamos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica en cierres" ON cierres FOR SELECT USING (true);

CREATE POLICY "Permitir insercion publica en sedes" ON sedes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en productos" ON productos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en mesas" ON mesas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en consumos" ON consumos_mesa FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en movimientos" ON movimientos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en ventas" ON ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en detalle_ventas" ON detalle_ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en creditos" ON creditos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en prestamos" ON prestamos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir insercion publica en cierres" ON cierres FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizacion publica en sedes" ON sedes FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en productos" ON productos FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en mesas" ON mesas FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en consumos" ON consumos_mesa FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en movimientos" ON movimientos FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en ventas" ON ventas FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en detalle_ventas" ON detalle_ventas FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en creditos" ON creditos FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en prestamos" ON prestamos FOR UPDATE USING (true);
CREATE POLICY "Permitir actualizacion publica en cierres" ON cierres FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminacion publica en sedes" ON sedes FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en productos" ON productos FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en mesas" ON mesas FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en consumos" ON consumos_mesa FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en movimientos" ON movimientos FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en ventas" ON ventas FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en detalle_ventas" ON detalle_ventas FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en creditos" ON creditos FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en prestamos" ON prestamos FOR DELETE USING (true);
CREATE POLICY "Permitir eliminacion publica en cierres" ON cierres FOR DELETE USING (true);


-- ==============================================================
-- 13. VALORES DE DEMOSTRACIÓN (Para poblar base de datos limpia)
-- ==============================================================

-- Inyectar Sedes de prueba
INSERT INTO sedes (id, nombre, direccion) VALUES 
('sede-norte', 'Licorera & Bar ALCO-JCCG Norte', 'Av. Principal #102'),
('sede-centro', 'ALCO-JCCG Express Centro', 'Calle 15 #5-40');

-- Inyectar Productos Sede Norte
INSERT INTO productos (id, sede_id, codigo_barras, nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
('p1', 'sede-norte', '770123456781', 'Cerveza Club Colombia Dorada', 'Cervezas', 3500, 6000, 48, 15),
('p2', 'sede-norte', '770123456782', 'Cerveza Corona Extra 355ml', 'Cervezas', 5000, 9000, 72, 24),
('p4', 'sede-norte', '770123456783', 'Cerveza Aguila Light Botella', 'Cervezas', 2800, 4500, 120, 30),
('p5', 'sede-norte', '770123456784', 'Whisky Johnnie Walker Black Label 700ml', 'Licores', 110000, 165000, 12, 5),
('p7', 'sede-norte', '770123456785', 'Aguardiente Antioqueño Azul 750ml', 'Licores', 42000, 68000, 24, 8),
('p9', 'sede-norte', '770123456786', 'Ron Medellin Añejo 3 Años 750ml', 'Licores', 38000, 58000, 15, 6),
('p10', 'sede-norte', '770123456787', 'Gaseosa Coca-Cola 1.5L', 'Gaseosas', 4000, 7000, 30, 10);

-- Inyectar Productos Sede Centro
INSERT INTO productos (id, sede_id, codigo_barras, nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
('p3', 'sede-centro', '770123456782', 'Cerveza Corona Extra 355ml', 'Cervezas', 5000, 8500, 8, 20),
('p6', 'sede-centro', '770123456784', 'Whisky Johnnie Walker Black Label 700ml', 'Licores', 110000, 160000, 4, 5),
('p8', 'sede-centro', '770123456785', 'Aguardiente Antioqueño Azul 750ml', 'Licores', 42000, 65000, 18, 8),
('p11', 'sede-centro', '770123456787', 'Gaseosa Coca-Cola 1.5L', 'Gaseosas', 4000, 6500, 14, 10);

-- Inyectar Mesas de prueba
INSERT INTO mesas (id, sede_id, numero_mesa, estado, cliente_nombre) VALUES
('m1', 'sede-norte', 'Mesa 1', 'DISPONIBLE', ''),
('m2', 'sede-norte', 'Mesa 2', 'OCUPADA', 'Andrés López'),
('m3', 'sede-norte', 'Mesa 3', 'DISPONIBLE', ''),
('m4', 'sede-norte', 'Mesa 4', 'PAGANDO', 'Familia Gómez'),
('m5', 'sede-norte', 'Mesa 5', 'DISPONIBLE', ''),
('m6', 'sede-norte', 'Barra Asientos', 'DISPONIBLE', ''),
('m7', 'sede-centro', 'Mesa 1', 'DISPONIBLE', ''),
('m8', 'sede-centro', 'Mesa 2', 'OCUPADA', 'Carlos G.');

-- Inyectar Consumos Activos de Mesa de prueba
INSERT INTO consumos_mesa (id, mesa_id, producto_id, cantidad, precio_unitario, registrado_por) VALUES
('c1', 'm2', 'p1', 3, 6000, 'Diana Cajero'),
('c2', 'm4', 'p7', 1, 68000, 'Diana Cajero'),
('c3', 'm4', 'p10', 2, 7000, 'Diana Cajero'),
('c4', 'm8', 'p3', 4, 8500, 'Juan Admin');

-- Inyectar Movimientos de Auditoría Demo
INSERT INTO movimientos (id, producto_id, producto_nombre, sede_id, tipo, cantidad, motivo, registrado_por) VALUES
('mov1', 'p1', 'Cerveza Club Colombia Dorada', 'sede-norte', 'INGRESO', 48, 'Lote de compra inicial', 'Diana Cajero'),
('mov2', 'p5', 'Whisky Johnnie Walker Black Label 700ml', 'sede-norte', 'INGRESO', 12, 'Reabastecimiento de bodega', 'Diana Cajero'),
('mov3', 'p3', 'Cerveza Corona Extra 355ml', 'sede-centro', 'EGRESO', 12, 'Ajuste por botella rota', 'Juan Admin');

-- Inyectar Ventas Demo
INSERT INTO ventas (id, sede_id, cliente_nombre, total, metodo_pago, atendido_por) VALUES
('v1', 'sede-norte', 'Cliente General', 24000, 'EFECTIVO', 'Diana Cajero');

INSERT INTO detalle_ventas (venta_id, producto_id, nombre, cantidad, precio_unitario) VALUES
('v1', 'p1', 'Cerveza Club Colombia Dorada', 4, 6000);

-- Inyectar Créditos Demo
INSERT INTO creditos (id, sede_id, cliente_nombre, venta_id, total_deuda, total_pagado, estado, registrado_por, notas) VALUES
('cr-1', 'sede-norte', 'Carlos Restrepo', 'v1', 24000, 10000, 'PENDIENTE', 'Diana Cajero', 'Crédito parcial otorgado para abonar luego');

-- Inyectar Préstamos Demo
INSERT INTO prestamos (id, sede_id, cliente_nombre, botella_nombre, cantidad, estado, registrado_por, descontó_stock, notas) VALUES
('pr-1', 'sede-norte', 'Pedro Gómez', 'Envase Cerveza Club Colombia Dorada', 6, 'PENDIENTE', 'Diana Cajero', FALSE, 'Prestó envases vacíos para el fin de semana');
