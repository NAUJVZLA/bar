import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
  console.warn(
    '⚠️ Alico Bar POS: Corriendo en MODO DEMO con almacenamiento persistente local (localStorage).\nConfigure NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para conectar con Supabase.'
  );
}

export const supabase: SupabaseClient | null = !isMockMode 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// MOCK STATE TYPES & INTERFACES
// ==========================================
export interface Sede {
  id: string;
  nombre: string;
}

export interface RecetaItem {
  insumo_id: string;
  insumo_nombre: string;
  cantidad: number;
  unidad: string;
}

export interface Insumo {
  id: string;
  sede_id: string;
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
}

export interface Producto {
  id: string;
  sede_id: string;
  codigo_barras: string;
  nombre: string;
  categoria: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  registrado_por?: string;
  tiene_receta?: boolean;
  receta?: RecetaItem[];
}

export interface ConsumoItem {
  id: string;
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  registrado_por: string;
  cliente_nombre?: string;
  entregado_por?: string;
}

export interface Mesa {
  id: string;
  sede_id: string;
  numero_mesa: string;
  estado: 'DISPONIBLE' | 'OCUPADA' | 'PAGANDO';
  cliente_nombre: string;
  consumos: ConsumoItem[];
}

export interface Movimiento {
  id: string;
  producto_id: string;
  producto_nombre: string;
  sede_id: string;
  tipo: 'INGRESO' | 'EGRESO';
  cantidad: number;
  motivo: string;
  registrado_por: string;
  fecha_hora: string;
}

export interface VentaItem {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Venta {
  id: string;
  sede_id: string;
  cliente_nombre: string;
  total: number;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO';
  atendido_por: string;
  fecha_hora: string;
  es_directa?: boolean;
  estado?: 'COMPLETADA' | 'ANULADA';
  razon_anulacion?: string;
  items: VentaItem[];
}

export interface CreditoCliente {
  id: string;
  sede_id: string;
  cliente_nombre: string;
  venta_id?: string;
  total_deuda: number;
  total_pagado: number;
  estado: 'PENDIENTE' | 'PAGADO';
  fecha_registro: string;
  fecha_pago?: string;
  registrado_por: string;
  notas?: string;
}

export interface PrestamoBotella {
  id: string;
  sede_id: string;
  cliente_nombre: string;
  botella_nombre: string;
  cantidad: number;
  estado: 'PENDIENTE' | 'DEVUELTO';
  fecha_prestamo: string;
  fecha_devolucion?: string;
  registrado_por: string;
  descontó_stock: boolean;
  producto_id?: string;
  notas?: string;
}

export interface CierreCaja {
  id: string;
  sede_id: string;
  fecha_hora: string;
  monto_apertura: number;
  ventas_efectivo: number;
  ventas_tarjeta: number;
  ventas_transferencia: number;
  ventas_credito: number;
  ventas_total: number;
  monto_real: number;
  descuadre: number;
  registrado_por: string;
  notas?: string;
  ventas_count: number;
}

export interface AuditLog {
  id: string;
  sede_id: string;
  usuario: string;
  accion: string;
  detalle: string;
  fecha_hora: string;
}

export interface Refrigerio {
  id: string;
  sede_id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  empleado_nombre: string;
  fecha_hora: string;
  notas?: string;
}

// ==========================================
// MOCK STATE INITIAL DATA
// ==========================================
const INITIAL_SEDES: Sede[] = [
  { id: 'sede-norte', nombre: 'Licorera & Bar ALCO-JCCG Norte' },
  { id: 'sede-centro', nombre: 'ALCO-JCCG Express Centro' }
];

const INITIAL_INSUMOS: Insumo[] = [
  { id: 'i1', sede_id: 'sede-norte', nombre: 'Carne de res molida', unidad: 'g', stock_actual: 3000, stock_minimo: 500, costo_unitario: 20 },
  { id: 'i2', sede_id: 'sede-norte', nombre: 'Pan de hamburguesa', unidad: 'und', stock_actual: 25, stock_minimo: 5, costo_unitario: 500 },
  { id: 'i3', sede_id: 'sede-norte', nombre: 'Pan de perro caliente', unidad: 'und', stock_actual: 30, stock_minimo: 5, costo_unitario: 400 },
  { id: 'i4', sede_id: 'sede-norte', nombre: 'Salchicha Americana', unidad: 'und', stock_actual: 40, stock_minimo: 10, costo_unitario: 800 },
  { id: 'i5', sede_id: 'sede-norte', nombre: 'Queso amarillo (tajada)', unidad: 'und', stock_actual: 40, stock_minimo: 10, costo_unitario: 300 },
  { id: 'i6', sede_id: 'sede-norte', nombre: 'Queso mozzarella rallado', unidad: 'g', stock_actual: 1000, stock_minimo: 200, costo_unitario: 15 },
  { id: 'i7', sede_id: 'sede-norte', nombre: 'Papas a la francesa', unidad: 'g', stock_actual: 5000, stock_minimo: 1000, costo_unitario: 8 },
  { id: 'i8', sede_id: 'sede-norte', nombre: 'Ripio de papa', unidad: 'g', stock_actual: 1000, stock_minimo: 200, costo_unitario: 5 },
  { id: 'i9', sede_id: 'sede-norte', nombre: 'Salsas variadas', unidad: 'ml', stock_actual: 2000, stock_minimo: 500, costo_unitario: 2 }
];

const INITIAL_PRODUCTS: Producto[] = [
  { id: 'p1', sede_id: 'sede-norte', codigo_barras: '770123456781', nombre: 'Cerveza Club Colombia Dorada', categoria: 'Cervezas', precio_compra: 3500, precio_venta: 6000, stock_actual: 48, stock_minimo: 15 },
  { id: 'p2', sede_id: 'sede-norte', codigo_barras: '770123456782', nombre: 'Cerveza Corona Extra 355ml', categoria: 'Cervezas', precio_compra: 5000, precio_venta: 9000, stock_actual: 72, stock_minimo: 24 },
  { id: 'p3', sede_id: 'sede-centro', codigo_barras: '770123456782', nombre: 'Cerveza Corona Extra 355ml', categoria: 'Cervezas', precio_compra: 5000, precio_venta: 8500, stock_actual: 8, stock_minimo: 20 },
  { id: 'p4', sede_id: 'sede-norte', codigo_barras: '770123456783', nombre: 'Cerveza Aguila Light Botella', categoria: 'Cervezas', precio_compra: 2800, precio_venta: 4500, stock_actual: 120, stock_minimo: 30 },
  { id: 'p5', sede_id: 'sede-norte', codigo_barras: '770123456784', nombre: 'Whisky Johnnie Walker Black Label 700ml', categoria: 'Licores', precio_compra: 110000, precio_venta: 165000, stock_actual: 12, stock_minimo: 5 },
  { id: 'p6', sede_id: 'sede-centro', codigo_barras: '770123456784', nombre: 'Whisky Johnnie Walker Black Label 700ml', categoria: 'Licores', precio_compra: 110000, precio_venta: 160000, stock_actual: 4, stock_minimo: 5 },
  { id: 'p7', sede_id: 'sede-norte', codigo_barras: '770123456785', nombre: 'Aguardiente Antioqueño Azul 750ml', categoria: 'Licores', precio_compra: 42000, precio_venta: 68000, stock_actual: 24, stock_minimo: 8 },
  { id: 'p8', sede_id: 'sede-centro', codigo_barras: '770123456785', nombre: 'Aguardiente Antioqueño Azul 750ml', categoria: 'Licores', precio_compra: 42000, precio_venta: 65000, stock_actual: 18, stock_minimo: 8 },
  { id: 'p9', sede_id: 'sede-norte', codigo_barras: '770123456786', nombre: 'Ron Medellin Añejo 3 Años 750ml', categoria: 'Licores', precio_compra: 38000, precio_venta: 58000, stock_actual: 15, stock_minimo: 6 },
  { id: 'p10', sede_id: 'sede-norte', codigo_barras: '770123456787', nombre: 'Gaseosa Coca-Cola 1.5L', categoria: 'Gaseosas', precio_compra: 4000, precio_venta: 7000, stock_actual: 30, stock_minimo: 10 },
  { id: 'p11', sede_id: 'sede-centro', codigo_barras: '770123456787', nombre: 'Gaseosa Coca-Cola 1.5L', categoria: 'Gaseosas', precio_compra: 4000, precio_venta: 6500, stock_actual: 14, stock_minimo: 10 },
  // Comidas Rápidas (Productos con Receta)
  { 
    id: 'p12', sede_id: 'sede-norte', codigo_barras: 'COM-001', nombre: 'Hamburguesa Sencilla', categoria: 'Comidas', 
    precio_compra: 0, precio_venta: 15000, stock_actual: 15, stock_minimo: 5,
    tiene_receta: true,
    receta: [
      { insumo_id: 'i1', insumo_nombre: 'Carne de res molida', cantidad: 120, unidad: 'g' },
      { insumo_id: 'i2', insumo_nombre: 'Pan de hamburguesa', cantidad: 1, unidad: 'und' },
      { insumo_id: 'i5', insumo_nombre: 'Queso amarillo (tajada)', cantidad: 1, unidad: 'und' }
    ]
  },
  { 
    id: 'p13', sede_id: 'sede-norte', codigo_barras: 'COM-002', nombre: 'Perro Caliente Tradicional', categoria: 'Comidas', 
    precio_compra: 0, precio_venta: 12000, stock_actual: 20, stock_minimo: 5,
    tiene_receta: true,
    receta: [
      { insumo_id: 'i3', insumo_nombre: 'Pan de perro caliente', cantidad: 1, unidad: 'und' },
      { insumo_id: 'i4', insumo_nombre: 'Salchicha Americana', cantidad: 1, unidad: 'und' },
      { insumo_id: 'i8', insumo_nombre: 'Ripio de papa', cantidad: 30, unidad: 'g' },
      { insumo_id: 'i6', insumo_nombre: 'Queso mozzarella rallado', cantidad: 40, unidad: 'g' },
      { insumo_id: 'i9', insumo_nombre: 'Salsas variadas', cantidad: 20, unidad: 'ml' }
    ]
  }
];

const INITIAL_MESAS: Mesa[] = [
  { id: 'm1', sede_id: 'sede-norte', numero_mesa: 'Mesa 1', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm2', sede_id: 'sede-norte', numero_mesa: 'Mesa 2', estado: 'OCUPADA', cliente_nombre: 'Andrés López', consumos: [
    { id: 'c1', producto_id: 'p1', nombre: 'Cerveza Club Colombia Dorada', cantidad: 3, precio_unitario: 6000, registrado_por: 'Diana Cajero' }
  ] },
  { id: 'm3', sede_id: 'sede-norte', numero_mesa: 'Mesa 3', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm4', sede_id: 'sede-norte', numero_mesa: 'Mesa 4', estado: 'PAGANDO', cliente_nombre: 'Familia Gómez', consumos: [
    { id: 'c2', producto_id: 'p7', nombre: 'Aguardiente Antioqueño Azul 750ml', cantidad: 1, precio_unitario: 68000, registrado_por: 'Diana Cajero' },
    { id: 'c3', producto_id: 'p10', nombre: 'Gaseosa Coca-Cola 1.5L', cantidad: 2, precio_unitario: 7000, registrado_por: 'Diana Cajero' }
  ] },
  { id: 'm5', sede_id: 'sede-norte', numero_mesa: 'Mesa 5', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm6', sede_id: 'sede-norte', numero_mesa: 'Barra Asientos', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm7', sede_id: 'sede-centro', numero_mesa: 'Mesa 1', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm8', sede_id: 'sede-centro', numero_mesa: 'Mesa 2', estado: 'OCUPADA', cliente_nombre: 'Carlos G.', consumos: [
    { id: 'c4', producto_id: 'p3', nombre: 'Cerveza Corona Extra 355ml', cantidad: 4, precio_unitario: 8500, registrado_por: 'Juan Admin' }
  ] }
];

const INITIAL_MOVIMIENTOS: Movimiento[] = [
  { id: 'mov1', producto_id: 'p1', producto_nombre: 'Cerveza Club Colombia Dorada', sede_id: 'sede-norte', tipo: 'INGRESO', cantidad: 48, motivo: 'Lote de compra inicial', registrado_por: 'Diana Cajero', fecha_hora: '2026-05-22T02:30:00' },
  { id: 'mov2', producto_id: 'p5', producto_nombre: 'Whisky Johnnie Walker Black Label 700ml', sede_id: 'sede-norte', tipo: 'INGRESO', cantidad: 12, motivo: 'Reabastecimiento de bodega', registrado_por: 'Diana Cajero', fecha_hora: '2026-05-22T03:15:00' },
  { id: 'mov3', producto_id: 'p3', producto_nombre: 'Cerveza Corona Extra 355ml', sede_id: 'sede-centro', tipo: 'EGRESO', cantidad: 12, motivo: 'Ajuste por botella rota', registrado_por: 'Juan Admin', fecha_hora: '2026-05-22T05:00:00' }
];

const INITIAL_VENTAS: Venta[] = [
  { id: 'v1', sede_id: 'sede-norte', cliente_nombre: 'Cliente General', total: 24000, metodo_pago: 'EFECTIVO', atendido_por: 'Diana Cajero', fecha_hora: '2026-05-22T06:00:00', items: [
    { producto_id: 'p1', nombre: 'Cerveza Club Colombia Dorada', cantidad: 4, precio_unitario: 6000 }
  ]}
];

const INITIAL_CREDITOS: CreditoCliente[] = [
  {
    id: 'cr-1',
    sede_id: 'sede-norte',
    cliente_nombre: 'Carlos Restrepo',
    venta_id: 'v1',
    total_deuda: 24000,
    total_pagado: 10000,
    estado: 'PENDIENTE',
    fecha_registro: '2026-05-22T06:00:00',
    registrado_por: 'Diana Cajero',
    notas: 'Crédito parcial otorgado para abonar luego'
  }
];

const INITIAL_PRESTAMOS: PrestamoBotella[] = [
  {
    id: 'pr-1',
    sede_id: 'sede-norte',
    cliente_nombre: 'Pedro Gómez',
    botella_nombre: 'Envase Cerveza Club Colombia Dorada',
    cantidad: 6,
    estado: 'PENDIENTE',
    fecha_prestamo: '2026-05-22T04:30:00',
    registrado_por: 'Diana Cajero',
    descontó_stock: false,
    notas: 'Prestó envases vacíos para el fin de semana'
  }
];

const getLocalStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    return fallback;
  }
};

const setLocalStorage = (key: string, value: any): void => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error guardando en localStorage', e);
    }
  }
};

export interface MockDataStore {
  sedes: Sede[];
  insumos: Insumo[];
  productos: Producto[];
  mesas: Mesa[];
  movimientos: Movimiento[];
  ventas: Venta[];
  creditos: CreditoCliente[];
  prestamos: PrestamoBotella[];
  cierres: CierreCaja[];
  auditoria: AuditLog[];
  refrigerios: Refrigerio[];
}

// ==========================================
// SUPABASE OFFLINE-FIRST SYNC ENGINE
// ==========================================
export const syncTableToSupabase = async (table: keyof MockDataStore) => {
  if (isMockMode || !supabase) return;
  try {
    let data = getMockData()[table];
    if (data.length > 0) {
      // Sanitización para evitar que Supabase rechace el upsert por columnas inexistentes o inconsistentes (creado_en)
      let payload = data;
      if (table === 'productos') {
        payload = (data as Producto[]).map(({ registrado_por, ...rest }: any) => {
          const { creado_en, ...finalRest } = rest;
          return finalRest;
        }) as any;
      } else if (table === 'prestamos') {
        payload = (data as PrestamoBotella[]).map((p: any) => ({
          id: p.id,
          sede_id: p.sede_id,
          cliente_nombre: p.cliente_nombre,
          botella_nombre: p.botella_nombre,
          cantidad: Number(p.cantidad) || 0,
          estado: p.estado,
          fecha_prestamo: p.fecha_prestamo,
          fecha_devolucion: p.fecha_devolucion || null,
          registrado_por: p.registrado_por,
          desconto_stock: p.descontó_stock ?? false,
          producto_id: p.producto_id || null,
          notas: p.notas || null
        })) as any;
      } else if (table === 'creditos') {
        payload = (data as CreditoCliente[]).map((p: any) => ({
          id: p.id,
          sede_id: p.sede_id,
          cliente_nombre: p.cliente_nombre,
          venta_id: p.venta_id || null,
          total_deuda: Number(p.total_deuda) || 0,
          total_pagado: Number(p.total_pagado) || 0,
          estado: p.estado,
          fecha_registro: p.fecha_registro,
          fecha_pago: p.fecha_pago || null,
          registrado_por: p.registrado_por,
          notas: p.notas || null
        })) as any;
      } else if (table === 'auditoria') {
        payload = (data as AuditLog[]).map((a: any) => ({
          id: a.id,
          sede_id: a.sede_id,
          usuario: a.usuario,
          accion: a.accion,
          detalle: a.detalle,
          fecha_hora: a.fecha_hora
        })) as any;
      } else if (table === 'refrigerios') {
        payload = (data as Refrigerio[]).map((r: any) => ({
          id: r.id,
          sede_id: r.sede_id,
          producto_id: r.producto_id,
          producto_nombre: r.producto_nombre,
          cantidad: Number(r.cantidad) || 0,
          empleado_nombre: r.empleado_nombre,
          fecha_hora: r.fecha_hora,
          notas: r.notas || null
        })) as any;
      } else {
        payload = (data as any[]).map((p: any) => {
          const { creado_en, ...rest } = p;
          return rest;
        }) as any;
      }

      const { error } = await supabase.from(table).upsert(payload as any);
      if (error) {
        console.error(`[Alico Sync] Error subiendo tabla ${table} a Supabase:`, JSON.stringify(error, null, 2), "Original:", error);
      }
    }
  } catch (err) {
    console.error(`[Alico Sync] Fallo de red al sincronizar ${table}:`, err);
  }
};

export const deleteFromSupabase = async (table: string, id: string) => {
  if (isMockMode || !supabase) return;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`[Alico Sync] Error eliminando ${id} de ${table} en Supabase:`, error);
    }
  } catch (err) {
    console.error(`[Alico Sync] Fallo de red al eliminar en ${table}:`, err);
  }
};

let activeSyncsCount = 0;

export const syncFromSupabase = async (): Promise<boolean> => {
  if (isMockMode || !supabase) return false;
  if (activeSyncsCount > 0) {
    console.log('⏳ [Alico Sync] Sincronización entrante omitida porque hay subidas locales en progreso.');
    return false;
  }
  try {
    console.log('🔄 [Alico Sync] Descargando base de datos desde Supabase...');
    const [
      sedesRes,
      insumosRes,
      productosRes,
      mesasRes,
      movimientosRes,
      ventasRes,
      creditosRes,
      prestamosRes,
      cierresRes,
      refrigeriosRes
    ] = await Promise.all([
      supabase.from('sedes').select('*'),
      supabase.from('insumos').select('*'),
      supabase.from('productos').select('*'),
      supabase.from('mesas').select('*'),
      supabase.from('movimientos').select('*'),
      supabase.from('ventas').select('*'),
      supabase.from('creditos').select('*'),
      supabase.from('prestamos').select('*'),
      supabase.from('cierres').select('*'),
      supabase.from('refrigerios').select('*')
    ]);

    if (sedesRes.error) throw sedesRes.error;
    if (insumosRes.error) throw insumosRes.error;
    if (productosRes.error) throw productosRes.error;
    if (mesasRes.error) throw mesasRes.error;
    if (movimientosRes.error) throw movimientosRes.error;
    if (ventasRes.error) throw ventasRes.error;
    if (creditosRes.error) throw creditosRes.error;
    if (prestamosRes.error) throw prestamosRes.error;
    if (cierresRes.error) throw cierresRes.error;
    if (refrigeriosRes.error) throw refrigeriosRes.error;

    // Cargar Auditoría de forma defensiva por si la tabla no existe en la BD del usuario
    let auditoriaRes: any = { data: [] };
    try {
      const res = await supabase.from('auditoria').select('*');
      if (!res.error) auditoriaRes = res;
    } catch (e) {
      console.warn('⚠️ [Alico Sync] La tabla "auditoria" no está creada en Supabase. Usando almacenamiento local.');
    }

    // Parsear y sanitizar tipos de datos numéricos y mapear campos de base de datos
    const parsedInsumos = (insumosRes.data || []).map((i: any) => ({
      ...i,
      stock_actual: Number(i.stock_actual) || 0,
      stock_minimo: Number(i.stock_minimo) || 0,
      costo_unitario: Number(i.costo_unitario) || 0
    }));

    const parsedProductos = (productosRes.data || []).map((p: any) => ({
      ...p,
      precio_compra: Number(p.precio_compra) || 0,
      precio_venta: Number(p.precio_venta) || 0,
      stock_actual: Number(p.stock_actual) || 0,
      stock_minimo: Number(p.stock_minimo) || 0
    }));

    const parsedMesas = (mesasRes.data || []).map((m: any) => ({
      ...m,
      consumos: (m.consumos || []).map((c: any) => ({
        ...c,
        cantidad: Number(c.cantidad) || 0,
        precio_unitario: Number(c.precio_unitario) || 0
      }))
    }));

    const parsedMovimientos = (movimientosRes.data || []).map((m: any) => ({
      ...m,
      cantidad: Number(m.cantidad) || 0
    }));

    const parsedVentas = (ventasRes.data || []).map((v: any) => ({
      ...v,
      total: Number(v.total) || 0,
      items: (v.items || []).map((item: any) => ({
        ...item,
        cantidad: Number(item.cantidad) || 0,
        precio_unitario: Number(item.precio_unitario) || 0
      }))
    }));

    const parsedCreditos = (creditosRes.data || []).map((c: any) => ({
      ...c,
      total_deuda: Number(c.total_deuda) || 0,
      total_pagado: Number(c.total_pagado) || 0
    }));

    const parsedPrestamos = (prestamosRes.data || []).map((p: any) => ({
      ...p,
      cantidad: Number(p.cantidad) || 0,
      descontó_stock: p.desconto_stock ?? false
    }));

    const parsedCierres = (cierresRes.data || []).map((c: any) => ({
      ...c,
      monto_apertura: Number(c.monto_apertura) || 0,
      ventas_efectivo: Number(c.ventas_efectivo) || 0,
      ventas_tarjeta: Number(c.ventas_tarjeta) || 0,
      ventas_transferencia: Number(c.ventas_transferencia) || 0,
      ventas_credito: Number(c.ventas_credito) || 0,
      ventas_total: Number(c.ventas_total) || 0,
      monto_real: Number(c.monto_real) || 0,
      descuadre: Number(c.descuadre) || 0,
      ventas_count: Number(c.ventas_count) || 0
    }));

    const parsedAuditoria = (auditoriaRes.data || []).map((a: any) => ({
      ...a
    }));

    const parsedRefrigerios = (refrigeriosRes.data || []).map((r: any) => ({
      ...r,
      cantidad: Number(r.cantidad) || 0
    }));

    // Actualizar caché local instantáneamente
    setLocalStorage('alico_sedes', sedesRes.data || []);
    setLocalStorage('alico_insumos', parsedInsumos);
    setLocalStorage('alico_productos', parsedProductos);
    setLocalStorage('alico_mesas', parsedMesas);
    setLocalStorage('alico_movimientos', parsedMovimientos);
    setLocalStorage('alico_ventas', parsedVentas);
    setLocalStorage('alico_creditos', parsedCreditos);
    setLocalStorage('alico_prestamos', parsedPrestamos);
    setLocalStorage('alico_cierres', parsedCierres);
    setLocalStorage('alico_auditoria', parsedAuditoria);
    setLocalStorage('alico_refrigerios', parsedRefrigerios);

    console.log('🟢 [Alico Sync] Base de datos local sincronizada con la nube.');
    window.dispatchEvent(new Event('supabase_synced'));
    // Despachamos cloudSync para que las UI recarguen los datos frescos sin cerrar los modales
    window.dispatchEvent(new Event('cloudSync'));
    return true;
  } catch (err) {
    console.error('❌ [Alico Sync] Error de red al sincronizar desde Supabase. Usando caché local offline:', err);
    return false;
  }
};

let realtimeChannel: any = null;

export const initRealtimeSync = () => {
  if (isMockMode || !supabase) return;
  
  // Evitar suscripciones duplicadas
  if (realtimeChannel) return realtimeChannel;
  
  realtimeChannel = supabase.channel('public:alico_sync');
  
  realtimeChannel.on(
    'postgres_changes',
    { event: '*', schema: 'public' },
    (payload: any) => {
      console.log('🔄 [Alico Realtime] Cambio detectado en la nube:', payload);
      // Para mantener la consistencia perfecta, descargamos el estado fresco.
      // Así aseguramos que mesas y ventas estén 100% igual al servidor.
      syncFromSupabase();
    }
  ).subscribe((status: string) => {
    if (status === 'SUBSCRIBED') {
      console.log('🟢 [Alico Realtime] Conectado a WebSockets. Escuchando cambios en vivo.');
    }
  });
  
  return realtimeChannel;
};

export const getMockData = (): MockDataStore => {
  const storedMesas = getLocalStorage<Mesa[]>('alico_mesas', INITIAL_MESAS);
  const safeMesas = storedMesas.map(m => ({
    ...m,
    consumos: m.consumos || []
  }));

  return {
    sedes: getLocalStorage<Sede[]>('alico_sedes', INITIAL_SEDES),
    insumos: getLocalStorage<Insumo[]>('alico_insumos', INITIAL_INSUMOS),
    productos: getLocalStorage<Producto[]>('alico_productos', INITIAL_PRODUCTS),
    mesas: safeMesas,
    movimientos: getLocalStorage<Movimiento[]>('alico_movimientos', INITIAL_MOVIMIENTOS),
    ventas: getLocalStorage<Venta[]>('alico_ventas', INITIAL_VENTAS),
    creditos: getLocalStorage<CreditoCliente[]>('alico_creditos', INITIAL_CREDITOS),
    prestamos: getLocalStorage<PrestamoBotella[]>('alico_prestamos', INITIAL_PRESTAMOS),
    cierres: getLocalStorage<CierreCaja[]>('alico_cierres', []),
    auditoria: getLocalStorage<AuditLog[]>('alico_auditoria', []),
    refrigerios: getLocalStorage<Refrigerio[]>('alico_refrigerios', []),
  };
};

export const saveMockData = (newData: Partial<MockDataStore>): void => {
  activeSyncsCount++;
  let syncQueue = Promise.resolve();

  if (newData.sedes) {
    setLocalStorage('alico_sedes', newData.sedes);
    syncQueue = syncQueue.then(() => syncTableToSupabase('sedes')) as Promise<void>;
  }
  if (newData.insumos) {
    setLocalStorage('alico_insumos', newData.insumos);
    syncQueue = syncQueue.then(() => syncTableToSupabase('insumos')) as Promise<void>;
  }
  if (newData.productos) {
    setLocalStorage('alico_productos', newData.productos);
    syncQueue = syncQueue.then(() => syncTableToSupabase('productos')) as Promise<void>;
  }
  if (newData.mesas) {
    setLocalStorage('alico_mesas', newData.mesas);
    syncQueue = syncQueue.then(() => syncTableToSupabase('mesas')) as Promise<void>;
  }
  if (newData.movimientos) {
    setLocalStorage('alico_movimientos', newData.movimientos);
    syncQueue = syncQueue.then(() => syncTableToSupabase('movimientos')) as Promise<void>;
  }
  if (newData.ventas) {
    setLocalStorage('alico_ventas', newData.ventas);
    syncQueue = syncQueue.then(() => syncTableToSupabase('ventas')) as Promise<void>;
  }
  if (newData.creditos) {
    setLocalStorage('alico_creditos', newData.creditos);
    syncQueue = syncQueue.then(() => syncTableToSupabase('creditos')) as Promise<void>;
  }
  if (newData.prestamos) {
    setLocalStorage('alico_prestamos', newData.prestamos);
    syncQueue = syncQueue.then(() => syncTableToSupabase('prestamos')) as Promise<void>;
  }
  if (newData.cierres) {
    setLocalStorage('alico_cierres', newData.cierres);
    syncQueue = syncQueue.then(() => syncTableToSupabase('cierres')) as Promise<void>;
  }
  if (newData.auditoria) {
    setLocalStorage('alico_auditoria', newData.auditoria);
    syncQueue = syncQueue.then(() => syncTableToSupabase('auditoria')) as Promise<void>;
  }
  if (newData.refrigerios) {
    setLocalStorage('alico_refrigerios', newData.refrigerios);
    syncQueue = syncQueue.then(() => syncTableToSupabase('refrigerios')) as Promise<void>;
  }

  syncQueue.finally(() => {
    setTimeout(() => {
      activeSyncsCount = Math.max(0, activeSyncsCount - 1);
    }, 800);
  });
};

// ==========================================
// MOCK STATE ACTIONS
// ==========================================
export const mockDb = {
  getSedes: (): Sede[] => {
    const sedes = getMockData().sedes;
    return sedes.filter(s => s.id !== 'sede-centro');
  },
  addSede: (sede: Omit<Sede, 'id'>): Sede => {
    const data = getMockData();
    const newSede: Sede = { id: 'sede-' + Date.now(), ...sede };
    data.sedes.push(newSede);
    saveMockData({ sedes: data.sedes });
    return newSede;
  },

  // --- INSUMOS ---
  getInsumos: (sedeId?: string): Insumo[] => {
    const insumos = getMockData().insumos;
    return sedeId ? insumos.filter(i => i.sede_id === sedeId) : insumos;
  },
  saveInsumo: (insumo: Partial<Insumo> & { sede_id: string; nombre: string; stock_actual: number; unidad: string }): Insumo => {
    const data = getMockData();
    let result: Insumo;
    if (insumo.id) {
      const idx = data.insumos.findIndex(i => i.id === insumo.id);
      if (idx !== -1) {
        data.insumos[idx] = { ...data.insumos[idx], ...insumo } as Insumo;
        result = data.insumos[idx];
      } else {
        throw new Error('Insumo no encontrado');
      }
    } else {
      const newId = 'i-' + Date.now();
      const newInsumo: Insumo = { 
        id: newId, 
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        stock_actual: insumo.stock_actual,
        stock_minimo: insumo.stock_minimo || 5,
        costo_unitario: insumo.costo_unitario || 0,
        sede_id: insumo.sede_id
      };
      data.insumos.push(newInsumo);
      result = newInsumo;
    }
    saveMockData({ insumos: data.insumos });
    return result;
  },
  deleteInsumo: (id: string, usuario?: string): boolean => {
    const data = getMockData();
    const ins = data.insumos.find(i => i.id === id);
    const insNombre = ins ? ins.nombre : id;
    const sedeId = ins ? ins.sede_id : 'sede-norte';
    
    data.insumos = data.insumos.filter(i => i.id !== id);
    saveMockData({ insumos: data.insumos });
    deleteFromSupabase('insumos', id);
    
    mockDb.registrarAuditLog(
      sedeId,
      usuario || 'Administrador',
      'ELIMINAR_INSUMO',
      `Eliminó el insumo "${insNombre}" (ID: ${id}) del catálogo de insumos de cocina.`
    );
    return true;
  },

  // --- PRODUCTOS ---
  getProductos: (sedeId?: string): Producto[] => {
    const prods = getMockData().productos;
    return sedeId ? prods.filter(p => p.sede_id === sedeId) : prods;
  },
  saveProducto: (prod: Partial<Producto> & { sede_id: string; nombre: string; stock_actual: number }): Producto => {
    const data = getMockData();
    let result: Producto;
    if (prod.id) {
      const idx = data.productos.findIndex(p => p.id === prod.id);
      if (idx !== -1) {
        const oldStock = data.productos[idx].stock_actual;
        const diff = prod.stock_actual - oldStock;
        // Registrar movimiento de inventario si cambia el stock físico disponible
        if (diff !== 0) {
          const type = diff > 0 ? 'INGRESO' : 'EGRESO';
          data.movimientos.unshift({
            id: 'mov-' + Date.now(),
            producto_id: prod.id,
            producto_nombre: prod.nombre,
            sede_id: prod.sede_id,
            tipo: type,
            cantidad: Math.abs(diff),
            motivo: 'Ajuste manual de inventario',
            registrado_por: prod.registrado_por || 'Sistema',
            fecha_hora: new Date().toISOString()
          });
        }
        data.productos[idx] = { ...data.productos[idx], ...prod } as Producto;
        result = data.productos[idx];
      } else {
        throw new Error('Producto no encontrado');
      }
    } else {
      const newId = 'p-' + Date.now();
      const newProd: Producto = { 
        id: newId, 
        codigo_barras: prod.codigo_barras || 'SIN-CODIGO',
        nombre: prod.nombre,
        categoria: prod.categoria || 'Varios',
        precio_compra: prod.precio_compra || 0,
        precio_venta: prod.precio_venta || 0,
        stock_actual: prod.stock_actual,
        stock_minimo: prod.stock_minimo || 5,
        sede_id: prod.sede_id,
        tiene_receta: prod.tiene_receta || false,
        receta: prod.receta || []
      };
      data.productos.push(newProd);
      
      data.movimientos.unshift({
        id: 'mov-' + Date.now(),
        producto_id: newId,
        producto_nombre: newProd.nombre,
        sede_id: newProd.sede_id,
        tipo: 'INGRESO',
        cantidad: newProd.stock_actual,
        motivo: 'Registro inicial de producto',
        registrado_por: prod.registrado_por || 'Sistema',
        fecha_hora: new Date().toISOString()
      });
      result = newProd;
    }
    saveMockData({ productos: data.productos, movimientos: data.movimientos });
    return result;
  },
  deleteProducto: (id: string, usuario?: string): boolean => {
    const data = getMockData();
    const prod = data.productos.find(p => p.id === id);
    const prodNombre = prod ? prod.nombre : id;
    const sedeId = prod ? prod.sede_id : 'sede-norte';
    
    data.productos = data.productos.filter(p => p.id !== id);
    saveMockData({ productos: data.productos });
    deleteFromSupabase('productos', id);
    
    mockDb.registrarAuditLog(
      sedeId,
      usuario || 'Administrador',
      'ELIMINAR_PRODUCTO',
      `Eliminó el producto "${prodNombre}" (ID: ${id}) del catálogo de inventario.`
    );
    return true;
  },

  // --- MESAS Y CONSUMOS ---
  getMesas: (sedeId?: string): Mesa[] => {
    const mesas = getMockData().mesas;
    return sedeId ? mesas.filter(m => m.sede_id === sedeId) : mesas;
  },
  updateMesaEstado: (mesaId: string, estado: 'DISPONIBLE' | 'OCUPADA' | 'PAGANDO', nuevaMesa?: Partial<Mesa>): Mesa | null => {
    const data = getMockData();
    const idx = data.mesas.findIndex(m => m.id === mesaId);
    if (idx !== -1) {
      const mesa = data.mesas[idx];
      mesa.estado = estado;
      if (estado === 'DISPONIBLE') {
        mesa.cliente_nombre = '';
        mesa.consumos = [];
      } else if (nuevaMesa) {
        mesa.numero_mesa = nuevaMesa.numero_mesa || mesa.numero_mesa;
        mesa.cliente_nombre = nuevaMesa.cliente_nombre || mesa.cliente_nombre;
      }
      saveMockData({ mesas: data.mesas });
      return mesa;
    }
    return null;
  },

  liberarMesaTotalmente: (mesaId: string, atendidoPor: string): Mesa | null => {
    const data = getMockData();
    const idx = data.mesas.findIndex(m => m.id === mesaId);
    if (idx !== -1) {
      const mesa = data.mesas[idx];
      
      // Reintegrar stock y registrar movimientos para cada consumo activo
      mesa.consumos.forEach(cons => {
        const prodIdx = data.productos.findIndex(p => p.id === cons.producto_id);
        if (prodIdx !== -1) {
          const prodActual = data.productos[prodIdx];
          
          if (prodActual.tiene_receta) {
             // Es Comida: reintegramos insumos
             mockDb._reintegrarInsumosReceta(data, prodActual, cons.cantidad);
          }
          
          // Reintegramos stock normal del producto y registramos movimiento
          prodActual.stock_actual += cons.cantidad;
          data.movimientos.unshift({
            id: 'mov-lib-' + Date.now() + '-' + cons.id,
            producto_id: cons.producto_id,
            producto_nombre: cons.nombre,
            sede_id: mesa.sede_id,
            tipo: 'INGRESO',
            cantidad: cons.cantidad,
            motivo: `Liberación de mesa ${mesa.numero_mesa} (Cancelación masiva)`,
            registrado_por: atendidoPor,
            fecha_hora: new Date().toISOString()
          });
        }
      });
      
      // Resetear mesa
      mesa.estado = 'DISPONIBLE';
      mesa.cliente_nombre = '';
      mesa.consumos = [];
      
      saveMockData({ mesas: data.mesas, productos: data.productos, movimientos: data.movimientos, insumos: data.insumos });
      return mesa;
    }
    return null;
  },
  
  // FUNCION AUXILIAR PARA RECETAS
  _descontarInsumosReceta: (data: MockDataStore, producto: Producto, cantidad: number) => {
    if (producto.tiene_receta && producto.receta && producto.receta.length > 0) {
      producto.receta.forEach(itemReceta => {
        const insumoIdx = data.insumos.findIndex(i => i.id === itemReceta.insumo_id);
        if (insumoIdx !== -1) {
          const cantidadARestar = itemReceta.cantidad * cantidad;
          if (data.insumos[insumoIdx].stock_actual < cantidadARestar) {
             throw new Error(`Insumo insuficiente: Solo te quedan ${data.insumos[insumoIdx].stock_actual} ${data.insumos[insumoIdx].unidad} de ${data.insumos[insumoIdx].nombre}. No puedes preparar este producto.`);
          }
          data.insumos[insumoIdx].stock_actual -= cantidadARestar;
        }
      });
    }
  },

  _reintegrarInsumosReceta: (data: MockDataStore, producto: Producto, cantidad: number) => {
    if (producto.tiene_receta && producto.receta && producto.receta.length > 0) {
      producto.receta.forEach(itemReceta => {
        const insumoIdx = data.insumos.findIndex(i => i.id === itemReceta.insumo_id);
        if (insumoIdx !== -1) {
          const cantidadASumar = itemReceta.cantidad * cantidad;
          data.insumos[insumoIdx].stock_actual += cantidadASumar;
        }
      });
    }
  },

  agregarConsumoMesa: (mesaId: string, consumo: Omit<ConsumoItem, 'id'>): Mesa | null => {
    const data = getMockData();
    const mesaIdx = data.mesas.findIndex(m => m.id === mesaId);
    if (mesaIdx !== -1) {
      const mesa = data.mesas[mesaIdx];
      const prodIdx = data.productos.findIndex(p => p.id === consumo.producto_id);
      if (prodIdx !== -1) {
        const prodActual = data.productos[prodIdx];
        
        if (prodActual.stock_actual < consumo.cantidad) {
          throw new Error(`Stock insuficiente de ${prodActual.nombre}. Solo quedan ${prodActual.stock_actual} unidades.`);
        }

        if (prodActual.tiene_receta) {
          mockDb._descontarInsumosReceta(data, prodActual, consumo.cantidad);
        }

        prodActual.stock_actual -= consumo.cantidad;
        data.movimientos.unshift({
          id: 'mov-' + Date.now(),
          producto_id: prodActual.id,
          producto_nombre: prodActual.nombre,
          sede_id: mesa.sede_id,
          tipo: 'EGRESO',
          cantidad: consumo.cantidad,
          motivo: `Consumo en ${mesa.numero_mesa}`,
          registrado_por: consumo.registrado_por,
          fecha_hora: new Date().toISOString()
        });
      }

      const consumoExistente = mesa.consumos.find(c => c.producto_id === consumo.producto_id);
      if (consumoExistente) {
        consumoExistente.cantidad += consumo.cantidad;
      } else {
        mesa.consumos.push({
          id: 'cons-' + Date.now(),
          producto_id: consumo.producto_id,
          nombre: consumo.nombre,
          cantidad: consumo.cantidad,
          precio_unitario: consumo.precio_unitario,
          registrado_por: consumo.registrado_por,
          cliente_nombre: consumo.cliente_nombre,
          entregado_por: consumo.entregado_por
        });
      }
      mesa.estado = 'OCUPADA';
      saveMockData({ mesas: data.mesas, productos: data.productos, movimientos: data.movimientos, insumos: data.insumos });
      return mesa;
    }
    return null;
  },

  cancelarConsumoMesa: (mesaId: string, consumoId: string, atendidoPor: string): Mesa | null => {
    const data = getMockData();
    const mesaIdx = data.mesas.findIndex(m => m.id === mesaId);
    if (mesaIdx !== -1) {
      const mesa = data.mesas[mesaIdx];
      const consIdx = mesa.consumos.findIndex(c => c.id === consumoId);
      if (consIdx !== -1) {
        const cons = mesa.consumos[consIdx];
        
        const prodIdx = data.productos.findIndex(p => p.id === cons.producto_id);
        if (prodIdx !== -1) {
          const prodActual = data.productos[prodIdx];
          
          if (prodActual.tiene_receta) {
             // Es Comida: reintegramos insumos
             mockDb._reintegrarInsumosReceta(data, prodActual, cons.cantidad);
          }
          
          // Reintegramos stock normal del producto
          prodActual.stock_actual += cons.cantidad;
          data.movimientos.unshift({
            id: 'mov-' + Date.now(),
            producto_id: cons.producto_id,
            producto_nombre: cons.nombre,
            sede_id: mesa.sede_id,
            tipo: 'INGRESO',
            cantidad: cons.cantidad,
            motivo: `Cancelación/Reintegro de consumo de ${mesa.numero_mesa}`,
            registrado_por: atendidoPor,
            fecha_hora: new Date().toISOString()
          });
        }

        mesa.consumos.splice(consIdx, 1);
        if (mesa.consumos.length === 0) {
          mesa.estado = 'DISPONIBLE';
          mesa.cliente_nombre = '';
        }
        saveMockData({ mesas: data.mesas, productos: data.productos, movimientos: data.movimientos, insumos: data.insumos });
        return mesa;
      }
    }
    return null;
  },

  // --- VENTAS ---
  getVentas: (sedeId?: string): Venta[] => {
    const ventas = getMockData().ventas;
    return sedeId ? ventas.filter(v => v.sede_id === sedeId) : ventas;
  },
  registrarVenta: (venta: Omit<Venta, 'id' | 'fecha_hora'> & { es_directa?: boolean }): Venta => {
    const data = getMockData();
    const newVenta: Venta = {
      id: 'v-' + Date.now(),
      fecha_hora: new Date().toISOString(),
      ...venta
    };

    if (venta.es_directa) {
      newVenta.items.forEach(item => {
        const prodIdx = data.productos.findIndex(p => p.id === item.producto_id);
        if (prodIdx !== -1) {
          const prodActual = data.productos[prodIdx];
          
          if (prodActual.stock_actual < item.cantidad) {
            throw new Error(`Stock insuficiente para ${item.nombre}.`);
          }

          if (prodActual.tiene_receta) {
             mockDb._descontarInsumosReceta(data, prodActual, item.cantidad);
          }

          prodActual.stock_actual -= item.cantidad;
          data.movimientos.unshift({
            id: 'mov-' + Date.now() + '-' + item.producto_id,
            producto_id: item.producto_id,
            producto_nombre: item.nombre,
            sede_id: venta.sede_id,
            tipo: 'EGRESO',
            cantidad: item.cantidad,
            motivo: 'Venta Directa POS',
            registrado_por: venta.atendido_por,
            fecha_hora: new Date().toISOString()
          });
        }
      });
    }

    if (venta.metodo_pago === 'CREDITO') {
      if (!venta.cliente_nombre || venta.cliente_nombre.trim() === 'Cliente General') {
        throw new Error('Debe especificar el nombre real del cliente para registrar una venta a crédito.');
      }
      const newCredito: CreditoCliente = {
        id: 'cr-' + Date.now(),
        sede_id: venta.sede_id,
        cliente_nombre: venta.cliente_nombre,
        venta_id: newVenta.id,
        total_deuda: newVenta.total,
        total_pagado: 0,
        estado: 'PENDIENTE',
        fecha_registro: newVenta.fecha_hora,
        registrado_por: venta.atendido_por,
        notas: `Crédito automático generado por venta #${newVenta.id}`
      };
      data.creditos.unshift(newCredito);
    }

    data.ventas.unshift(newVenta);
    saveMockData({ ventas: data.ventas, productos: data.productos, movimientos: data.movimientos, insumos: data.insumos, creditos: data.creditos });
    return newVenta;
  },
  anularVenta: (ventaId: string, razonAnulacion: string, atendidoPor: string, usuario?: string): Venta | null => {
    const data = getMockData();
    const vIdx = data.ventas.findIndex(v => v.id === ventaId);
    if (vIdx !== -1) {
      const venta = data.ventas[vIdx];
      if (venta.estado === 'ANULADA') return null;

      // Reintegrar inventario
      venta.items.forEach(item => {
        const prodIdx = data.productos.findIndex(p => p.id === item.producto_id);
        if (prodIdx !== -1) {
          const prodActual = data.productos[prodIdx];
          if (prodActual.tiene_receta) {
             mockDb._reintegrarInsumosReceta(data, prodActual, item.cantidad);
          }
          
          prodActual.stock_actual += item.cantidad;
          data.movimientos.unshift({
            id: 'mov-anu-' + Date.now() + '-' + item.producto_id,
            producto_id: prodActual.id,
            producto_nombre: prodActual.nombre,
            sede_id: venta.sede_id,
            tipo: 'INGRESO',
            cantidad: item.cantidad,
            motivo: `Anulación de Venta: ${razonAnulacion}`,
            registrado_por: atendidoPor,
            fecha_hora: new Date().toISOString()
          });
        }
      });

      venta.estado = 'ANULADA';
      venta.razon_anulacion = razonAnulacion;
      
      saveMockData({ ventas: data.ventas, productos: data.productos, movimientos: data.movimientos, insumos: data.insumos });
      
      // Registrar en Auditoría
      mockDb.registrarAuditLog(
        venta.sede_id,
        usuario || atendidoPor || 'Administrador',
        'ANULAR_VENTA',
        `Anuló la venta #${ventaId} (Monto total: $${venta.total.toLocaleString('es-CO')}). Razón: "${razonAnulacion}".`
      );
      
      return venta;
    }
    return null;
  },
  
  getMovimientos: (sedeId?: string): Movimiento[] => {
    const movs = getMockData().movimientos;
    return sedeId ? movs.filter(m => m.sede_id === sedeId) : movs;
  },
  getCategorias: (): string[] => {
    const defaultCats = ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios'];
    return getLocalStorage<string[]>('alico_categorias', defaultCats);
  },
  addCategoria: (categoria: string): string[] => {
    const cats = mockDb.getCategorias();
    const cleanCat = categoria.trim();
    if (cleanCat && !cats.some(c => c.toLowerCase() === cleanCat.toLowerCase())) {
      cats.push(cleanCat);
      setLocalStorage('alico_categorias', cats);
    }
    return cats;
  },
  deleteCategoria: (categoria: string): string[] => {
    const cats = mockDb.getCategorias();
    const updated = cats.filter(c => c !== categoria);
    setLocalStorage('alico_categorias', updated);
    return updated;
  },
  getCreditos: (sedeId?: string): CreditoCliente[] => {
    const creditos = getMockData().creditos;
    return sedeId ? creditos.filter(c => c.sede_id === sedeId) : creditos;
  },
  registrarCreditoManual: (credito: Omit<CreditoCliente, 'id' | 'fecha_registro' | 'estado' | 'total_pagado'>): CreditoCliente => {
    const data = getMockData();
    const newCredito: CreditoCliente = {
      id: 'cr-' + Date.now(),
      fecha_registro: new Date().toISOString(),
      total_pagado: 0,
      estado: 'PENDIENTE',
      ...credito
    };
    data.creditos.unshift(newCredito);
    saveMockData({ creditos: data.creditos });
    return newCredito;
  },
  registrarAbonoCredito: (creditoId: string, montoAbono: number): CreditoCliente | null => {
    const data = getMockData();
    const idx = data.creditos.findIndex(c => c.id === creditoId);
    if (idx !== -1) {
      const cred = data.creditos[idx];
      const nuevoTotalPagado = cred.total_pagado + montoAbono;
      cred.total_pagado = Math.min(cred.total_deuda, nuevoTotalPagado);
      if (cred.total_pagado >= cred.total_deuda) {
        cred.estado = 'PAGADO';
        cred.fecha_pago = new Date().toISOString();
      }
      saveMockData({ creditos: data.creditos });
      return cred;
    }
    return null;
  },
  getPrestamos: (sedeId?: string): PrestamoBotella[] => {
    const prestamos = getMockData().prestamos;
    return sedeId ? prestamos.filter(p => p.sede_id === sedeId) : prestamos;
  },
  registrarPrestamo: (prestamo: Omit<PrestamoBotella, 'id' | 'fecha_prestamo' | 'estado'> & { descontarStock?: boolean }): PrestamoBotella => {
    const data = getMockData();
    const newId = 'pr-' + Date.now();
    const newPrestamo: PrestamoBotella = {
      id: newId,
      fecha_prestamo: new Date().toISOString(),
      estado: 'PENDIENTE',
      ...prestamo
    };

    if (prestamo.descontarStock && prestamo.producto_id) {
      const prodIdx = data.productos.findIndex(p => p.id === prestamo.producto_id);
      if (prodIdx !== -1) {
        if (data.productos[prodIdx].stock_actual < prestamo.cantidad) {
          throw new Error(`Stock insuficiente para prestar ${prestamo.botella_nombre}. Solo quedan ${data.productos[prodIdx].stock_actual} unidades.`);
        }
        data.productos[prodIdx].stock_actual -= prestamo.cantidad;
        data.movimientos.unshift({
          id: 'mov-' + Date.now() + '-' + prestamo.producto_id,
          producto_id: prestamo.producto_id,
          producto_nombre: prestamo.botella_nombre,
          sede_id: prestamo.sede_id,
          tipo: 'EGRESO',
          cantidad: prestamo.cantidad,
          motivo: `Préstamo de botellas a ${prestamo.cliente_nombre}`,
          registrado_por: prestamo.registrado_por,
          fecha_hora: new Date().toISOString()
        });
      }
    }

    data.prestamos.unshift(newPrestamo);
    saveMockData({ prestamos: data.prestamos, productos: data.productos, movimientos: data.movimientos });
    return newPrestamo;
  },
  devolverPrestamo: (prestamoId: string, reintegrarStock?: boolean): PrestamoBotella | null => {
    const data = getMockData();
    const idx = data.prestamos.findIndex(p => p.id === prestamoId);
    if (idx !== -1) {
      const prestamo = data.prestamos[idx];
      prestamo.estado = 'DEVUELTO';
      prestamo.fecha_devolucion = new Date().toISOString();

      if (reintegrarStock && prestamo.producto_id) {
        const prodIdx = data.productos.findIndex(p => p.id === prestamo.producto_id);
        if (prodIdx !== -1) {
          data.productos[prodIdx].stock_actual += prestamo.cantidad;
          data.movimientos.unshift({
            id: 'mov-' + Date.now() + '-' + prestamo.producto_id,
            producto_id: prestamo.producto_id,
            producto_nombre: prestamo.botella_nombre,
            sede_id: prestamo.sede_id,
            tipo: 'INGRESO',
            cantidad: prestamo.cantidad,
            motivo: `Devolución de botellas prestadas por ${prestamo.cliente_nombre}`,
            registrado_por: prestamo.registrado_por || 'Sistema',
            fecha_hora: new Date().toISOString()
          });
        }
      }

      saveMockData({ prestamos: data.prestamos, productos: data.productos, movimientos: data.movimientos });
      return prestamo;
    }
    return null;
  },
  eliminarPrestamo: (prestamoId: string, usuario?: string): boolean => {
    const data = getMockData();
    const pr = data.prestamos.find(p => p.id === prestamoId);
    const detalle = pr ? `Préstamo de ${pr.cantidad} botellas de ${pr.botella_nombre} al cliente ${pr.cliente_nombre}.` : prestamoId;
    const SedeId = pr ? pr.sede_id : 'sede-norte';
    
    data.prestamos = data.prestamos.filter(p => p.id !== prestamoId);
    saveMockData({ prestamos: data.prestamos });
    deleteFromSupabase('prestamos', prestamoId);
    
    mockDb.registrarAuditLog(
      SedeId,
      usuario || 'Administrador',
      'ELIMINAR_PRESTAMO',
      `Eliminó un registro de préstamo del historial: ${detalle}`
    );
    return true;
  },
  limpiarPrestamosDevueltos: (sedeId: string, usuario?: string): boolean => {
    const data = getMockData();
    const devueltosSede = data.prestamos.filter(p => p.sede_id === sedeId && p.estado === 'DEVUELTO');
    if (devueltosSede.length === 0) return false;
    
    const cantidad = devueltosSede.reduce((sum, p) => sum + p.cantidad, 0);
    data.prestamos = data.prestamos.filter(p => !(p.sede_id === sedeId && p.estado === 'DEVUELTO'));
    
    activeSyncsCount++;
    saveMockData({ prestamos: data.prestamos });
    
    if (!isMockMode && supabase) {
      (async () => {
        try {
          const { error } = await supabase.from('prestamos').delete().eq('sede_id', sedeId).eq('estado', 'DEVUELTO');
          if (error) console.error('Error al limpiar préstamos en Supabase:', error);
        } catch (err) {
          console.error('Fallo al limpiar préstamos:', err);
        } finally {
          setTimeout(() => {
            activeSyncsCount = Math.max(0, activeSyncsCount - 1);
          }, 800);
        }
      })();
    } else {
      setTimeout(() => {
        activeSyncsCount = Math.max(0, activeSyncsCount - 1);
      }, 800);
    }
    
    mockDb.registrarAuditLog(
      sedeId,
      usuario || 'Administrador',
      'LIMPIAR_PRESTAMOS_DEVUELTOS',
      `Limpió todos los envases marcados como DEVUELTOS del historial (Total: ${devueltosSede.length} registros, ${cantidad} botellas).`
    );
    return true;
  },
  limpiarCreditosPagados: (sedeId: string, usuario?: string): boolean => {
    const data = getMockData();
    const pagadosSede = data.creditos.filter(c => c.sede_id === sedeId && c.estado === 'PAGADO');
    if (pagadosSede.length === 0) return false;
    
    const montoTotal = pagadosSede.reduce((sum, c) => sum + c.total_deuda, 0);
    data.creditos = data.creditos.filter(c => !(c.sede_id === sedeId && c.estado === 'PAGADO'));
    
    activeSyncsCount++;
    saveMockData({ creditos: data.creditos });
    
    if (!isMockMode && supabase) {
      (async () => {
        try {
          const { error } = await supabase.from('creditos').delete().eq('sede_id', sedeId).eq('estado', 'PAGADO');
          if (error) console.error('Error al limpiar créditos en Supabase:', error);
        } catch (err) {
          console.error('Fallo al limpiar créditos:', err);
        } finally {
          setTimeout(() => {
            activeSyncsCount = Math.max(0, activeSyncsCount - 1);
          }, 800);
        }
      })();
    } else {
      setTimeout(() => {
        activeSyncsCount = Math.max(0, activeSyncsCount - 1);
      }, 800);
    }
    
    mockDb.registrarAuditLog(
      sedeId,
      usuario || 'Administrador',
      'LIMPIAR_CREDITOS_PAGADOS',
      `Limpió todos los créditos marcados como PAGADOS del historial (Total: ${pagadosSede.length} cuentas, Monto: $${montoTotal.toLocaleString('es-CO')}).`
    );
    return true;
  },
  getCierres: (sedeId?: string): CierreCaja[] => {
    const cierres = getMockData().cierres;
    return /^\s*$/.test(sedeId || '') ? cierres : cierres.filter(c => c.sede_id === sedeId);
  },
  registrarCierre: (cierre: Omit<CierreCaja, 'id' | 'fecha_hora'>): CierreCaja => {
    const data = getMockData();
    const newCierre: CierreCaja = {
      id: 'cierre-' + Date.now(),
      fecha_hora: new Date().toISOString(),
      ...cierre
    };
    data.cierres.unshift(newCierre);
    saveMockData({ cierres: data.cierres });
    return newCierre;
  },
  registrarAuditLog: (sedeId: string, usuario: string, accion: string, detalle: string): AuditLog => {
    const data = getMockData();
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      sede_id: sedeId,
      usuario: usuario || 'Sistema',
      accion: accion,
      detalle: detalle,
      fecha_hora: new Date().toISOString()
    };
    data.auditoria = data.auditoria || [];
    data.auditoria.unshift(newLog);
    saveMockData({ auditoria: data.auditoria });
    return newLog;
  },
  getAuditLogs: (sedeId?: string): AuditLog[] => {
    const data = getMockData();
    const logs = data.auditoria || [];
    return sedeId ? logs.filter(l => l.sede_id === sedeId) : logs;
  },
  getRefrigerios: (sedeId?: string): Refrigerio[] => {
    const data = getMockData();
    const refs = data.refrigerios || [];
    return sedeId ? refs.filter(r => r.sede_id === sedeId) : refs;
  },
  registrarRefrigerio: (refrigerio: Omit<Refrigerio, 'id' | 'fecha_hora'>): Refrigerio => {
    const data = getMockData();
    
    // 1. Descontar stock del producto
    const prodIdx = data.productos.findIndex(p => p.id === refrigerio.producto_id);
    if (prodIdx === -1) {
      throw new Error('Producto no encontrado en el inventario');
    }
    const prod = data.productos[prodIdx];
    if (prod.stock_actual < refrigerio.cantidad) {
      throw new Error(`Stock insuficiente. Solo quedan ${prod.stock_actual} unidades.`);
    }
    prod.stock_actual -= refrigerio.cantidad;

    // 2. Si el producto tiene receta (comida fabricada), descontar insumos de cocina
    if (prod.tiene_receta && prod.receta && prod.receta.length > 0) {
      prod.receta.forEach(item => {
        const insIdx = data.insumos.findIndex(ins => ins.id === item.insumo_id && ins.sede_id === refrigerio.sede_id);
        if (insIdx !== -1) {
          const insumo = data.insumos[insIdx];
          const totalADescontar = item.cantidad * refrigerio.cantidad;
          insumo.stock_actual = Math.max(0, insumo.stock_actual - totalADescontar);
        }
      });
    }

    // 3. Registrar movimiento de EGRESO en el Kárdex
    const newMov: Movimiento = {
      id: 'mov-' + Date.now(),
      producto_id: refrigerio.producto_id,
      producto_nombre: refrigerio.producto_nombre,
      sede_id: refrigerio.sede_id,
      tipo: 'EGRESO',
      cantidad: refrigerio.cantidad,
      motivo: `Consumo Interno (Refrigerio de empleado: ${refrigerio.empleado_nombre})`,
      registrado_por: 'Sistema (Refrigerios)',
      fecha_hora: new Date().toISOString()
    };
    data.movimientos.unshift(newMov);

    // 4. Registrar refrigerio en el historial
    const newRefrigerio: Refrigerio = {
      id: 'ref-' + Date.now(),
      fecha_hora: new Date().toISOString(),
      ...refrigerio
    };
    data.refrigerios = data.refrigerios || [];
    data.refrigerios.unshift(newRefrigerio);

    // 5. Guardar en localStorage y sincronizar con Supabase
    saveMockData({
      productos: data.productos,
      insumos: data.insumos,
      movimientos: data.movimientos,
      refrigerios: data.refrigerios
    });

    // 6. Registrar en bitácora de auditoría
    mockDb.registrarAuditLog(
      refrigerio.sede_id,
      'Sistema (Refrigerios)',
      'REGISTRAR_REFRIGERIO',
      `Registró refrigerio para ${refrigerio.empleado_nombre}: ${refrigerio.cantidad}x ${refrigerio.producto_nombre}.`
    );

    return newRefrigerio;
  },
  resetDbToDemo: async (): Promise<void> => {
    setLocalStorage('alico_sedes', INITIAL_SEDES);
    setLocalStorage('alico_insumos', INITIAL_INSUMOS);
    setLocalStorage('alico_productos', INITIAL_PRODUCTS);
    setLocalStorage('alico_mesas', INITIAL_MESAS);
    setLocalStorage('alico_movimientos', INITIAL_MOVIMIENTOS);
    setLocalStorage('alico_ventas', INITIAL_VENTAS);
    setLocalStorage('alico_creditos', INITIAL_CREDITOS);
    setLocalStorage('alico_prestamos', INITIAL_PRESTAMOS);
    setLocalStorage('alico_cierres', []);
    setLocalStorage('alico_refrigerios', []);
    setLocalStorage('alico_categorias', ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios']);

    if (!isMockMode && supabase) {
      try {
        await supabase.from('refrigerios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('cierres').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('movimientos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('mesas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('insumos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sedes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        await supabase.from('sedes').insert(INITIAL_SEDES);
        await supabase.from('insumos').insert(INITIAL_INSUMOS);
        await supabase.from('productos').insert(INITIAL_PRODUCTS.map(({ registrado_por, ...rest }) => rest) as any);
        await supabase.from('mesas').insert(INITIAL_MESAS);
        await supabase.from('movimientos').insert(INITIAL_MOVIMIENTOS);
        await supabase.from('ventas').insert(INITIAL_VENTAS);
        await supabase.from('creditos').insert(INITIAL_CREDITOS);
        await supabase.from('prestamos').insert(INITIAL_PRESTAMOS.map(({ descontó_stock, ...rest }) => ({ ...rest, desconto_stock: descontó_stock })) as any);
      } catch (err) {
        console.error('Error reset remote Supabase:', err);
      }
    }
  },
  clearAllData: async (): Promise<void> => {
    const currentMesas = getLocalStorage<Mesa[]>('alico_mesas', []);
    const clearedMesas = currentMesas.map(m => ({
      ...m,
      estado: 'DISPONIBLE' as const,
      cliente_nombre: '',
      consumos: []
    }));

    setLocalStorage('alico_insumos', []);
    setLocalStorage('alico_productos', []);
    setLocalStorage('alico_mesas', clearedMesas);
    setLocalStorage('alico_movimientos', []);
    setLocalStorage('alico_ventas', []);
    setLocalStorage('alico_creditos', []);
    setLocalStorage('alico_prestamos', []);
    setLocalStorage('alico_cierres', []);
    setLocalStorage('alico_categorias', ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios']);

    if (!isMockMode && supabase) {
      try {
        await supabase.from('cierres').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('movimientos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        await supabase.from('mesas').update({
          estado: 'DISPONIBLE',
          cliente_nombre: '',
          consumos: []
        }).neq('id', '00000000-0000-0000-0000-000000000000');
        
        await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('insumos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Error clear remote Supabase:', err);
      }
    }
  }
};
