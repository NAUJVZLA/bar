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
  { 
    id: 'p12', sede_id: 'sede-norte', codigo_barras: 'COM-001', nombre: 'Hamburguesa Sencilla', categoria: 'Comidas', 
    precio_compra: 3000, precio_venta: 12000, stock_actual: 50, stock_minimo: 10, tiene_receta: true,
    receta: [
      { insumo_id: 'i1', insumo_nombre: 'Carne de res molida', cantidad: 120, unidad: 'g' },
      { insumo_id: 'i2', insumo_nombre: 'Pan de hamburguesa', cantidad: 1, unidad: 'und' },
      { insumo_id: 'i5', insumo_nombre: 'Queso amarillo (tajada)', cantidad: 1, unidad: 'und' }
    ]
  },
  { 
    id: 'p13', sede_id: 'sede-norte', codigo_barras: 'COM-002', nombre: 'Perro Caliente Especial', categoria: 'Comidas', 
    precio_compra: 2500, precio_venta: 9000, stock_actual: 40, stock_minimo: 10, tiene_receta: true,
    receta: [
      { insumo_id: 'i3', insumo_nombre: 'Pan de perro caliente', cantidad: 1, unidad: 'und' },
      { insumo_id: 'i4', insumo_nombre: 'Salchicha Americana', cantidad: 1, unidad: 'und' },
      { insumo_id: 'i8', insumo_nombre: 'Ripio de papa', cantidad: 30, unidad: 'g' }
    ]
  },
  { 
    id: 'p14', sede_id: 'sede-norte', codigo_barras: 'COM-003', nombre: 'Papas Locas (Porción)', categoria: 'Comidas', 
    precio_compra: 2000, precio_venta: 8000, stock_actual: 30, stock_minimo: 5, tiene_receta: true,
    receta: [
      { insumo_id: 'i7', insumo_nombre: 'Papas a la francesa', cantidad: 250, unidad: 'g' },
      { insumo_id: 'i4', insumo_nombre: 'Salchicha Americana', cantidad: 0.5, unidad: 'und' },
      { insumo_id: 'i6', insumo_nombre: 'Queso mozzarella rallado', cantidad: 40, unidad: 'g' }
    ]
  }
];

const INITIAL_MESAS: Mesa[] = [
  { id: 'm1', sede_id: 'sede-norte', numero_mesa: '1', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm2', sede_id: 'sede-norte', numero_mesa: '2', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm3', sede_id: 'sede-norte', numero_mesa: '3', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm4', sede_id: 'sede-norte', numero_mesa: 'Barra Principal', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm5', sede_id: 'sede-centro', numero_mesa: 'Express 1', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] },
  { id: 'm6', sede_id: 'sede-centro', numero_mesa: 'Express 2', estado: 'DISPONIBLE', cliente_nombre: '', consumos: [] }
];

const INITIAL_MOVIMIENTOS: Movimiento[] = [
  {
    id: 'mov-1',
    producto_id: 'p1',
    producto_nombre: 'Cerveza Club Colombia Dorada',
    sede_id: 'sede-norte',
    tipo: 'INGRESO',
    cantidad: 48,
    motivo: 'Inventario inicial de apertura',
    registrado_por: 'Diana Cajero',
    fecha_hora: '2026-05-22T04:00:00'
  }
];

const INITIAL_VENTAS: Venta[] = [
  {
    id: 'v1',
    sede_id: 'sede-norte',
    cliente_nombre: 'Carlos Restrepo',
    total: 24000,
    metodo_pago: 'CREDITO',
    atendido_por: 'Diana Cajero',
    fecha_hora: '2026-05-22T05:30:00',
    es_directa: true,
    estado: 'COMPLETADA',
    items: [
      { producto_id: 'p1', nombre: 'Cerveza Club Colombia Dorada', cantidad: 4, precio_unitario: 6000 }
    ]
  }
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
}

// Base de datos en memoria (RAM) para acceso síncrono ultra veloz
export let memoryDb: MockDataStore = {
  sedes: [],
  insumos: [],
  productos: [],
  mesas: [],
  movimientos: [],
  ventas: [],
  creditos: [],
  prestamos: [],
  cierres: [],
  auditoria: []
};

// Categorías del sistema
export const categories: string[] = ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios'];

// Cargar estado inicial
export const initializeDb = () => {
  if (isMockMode) {
    const storedMesas = getLocalStorage<Mesa[]>('alico_mesas', INITIAL_MESAS);
    const safeMesas = storedMesas.map(m => ({
      ...m,
      consumos: m.consumos || []
    }));
    memoryDb.sedes = getLocalStorage<Sede[]>('alico_sedes', INITIAL_SEDES);
    memoryDb.insumos = getLocalStorage<Insumo[]>('alico_insumos', INITIAL_INSUMOS);
    memoryDb.productos = getLocalStorage<Producto[]>('alico_productos', INITIAL_PRODUCTS);
    memoryDb.mesas = safeMesas;
    memoryDb.movimientos = getLocalStorage<Movimiento[]>('alico_movimientos', INITIAL_MOVIMIENTOS);
    memoryDb.ventas = getLocalStorage<Venta[]>('alico_ventas', INITIAL_VENTAS);
    memoryDb.creditos = getLocalStorage<CreditoCliente[]>('alico_creditos', INITIAL_CREDITOS);
    memoryDb.prestamos = getLocalStorage<PrestamoBotella[]>('alico_prestamos', INITIAL_PRESTAMOS);
    memoryDb.cierres = getLocalStorage<CierreCaja[]>('alico_cierres', []);
    memoryDb.auditoria = getLocalStorage<AuditLog[]>('alico_auditoria', []);

    const cats = getLocalStorage<string[]>('alico_categorias', ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios']);
    categories.splice(0, categories.length, ...cats);
  } else {
    // Supabase Mode: Inicializar con valores por defecto pero sin localStorage
    memoryDb.sedes = INITIAL_SEDES;
    memoryDb.insumos = INITIAL_INSUMOS;
    memoryDb.productos = INITIAL_PRODUCTS;
    memoryDb.mesas = INITIAL_MESAS.map(m => ({ ...m, consumos: m.consumos || [] }));
    memoryDb.movimientos = INITIAL_MOVIMIENTOS;
    memoryDb.ventas = INITIAL_VENTAS;
    memoryDb.creditos = INITIAL_CREDITOS;
    memoryDb.prestamos = INITIAL_PRESTAMOS;
    memoryDb.cierres = [];
    memoryDb.auditoria = [];
  }
};

if (typeof window !== 'undefined') {
  initializeDb();
}

// ==========================================
// SUPABASE OFFLINE-FIRST SYNC ENGINE
// ==========================================
export const syncTableToSupabase = async (table: keyof MockDataStore) => {
  if (isMockMode || !supabase) return;
  try {
    let data = getMockData()[table];
    if (data.length > 0) {
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
      cierresRes
    ] = await Promise.all([
      supabase.from('sedes').select('*'),
      supabase.from('insumos').select('*'),
      supabase.from('productos').select('*'),
      supabase.from('mesas').select('*'),
      supabase.from('movimientos').select('*'),
      supabase.from('ventas').select('*'),
      supabase.from('creditos').select('*'),
      supabase.from('prestamos').select('*'),
      supabase.from('cierres').select('*')
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

    let auditoriaRes: any = { data: [] };
    try {
      const res = await supabase.from('auditoria').select('*');
      if (!res.error) auditoriaRes = res;
    } catch (e) {
      console.warn('⚠️ [Alico Sync] La tabla "auditoria" no está creada en Supabase. Usando almacenamiento local.');
    }

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

    // Actualizar caché en memoria
    memoryDb.sedes = sedesRes.data || [];
    memoryDb.insumos = parsedInsumos;
    memoryDb.productos = parsedProductos;
    memoryDb.mesas = parsedMesas;
    memoryDb.movimientos = parsedMovimientos;
    memoryDb.ventas = parsedVentas;
    memoryDb.creditos = parsedCreditos;
    memoryDb.prestamos = parsedPrestamos;
    memoryDb.cierres = parsedCierres;
    memoryDb.auditoria = parsedAuditoria;

    // Derivar categorías de productos de forma dinámica
    const uniqueCats = Array.from(new Set([
      'Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios',
      ...parsedProductos.map(p => p.categoria)
    ]));
    categories.splice(0, categories.length, ...uniqueCats);

    console.log('🟢 [Alico Sync] Base de datos local sincronizada con la nube.');
    window.dispatchEvent(new Event('supabase_synced'));
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
  if (realtimeChannel) return realtimeChannel;
  
  realtimeChannel = supabase.channel('public:alico_sync');
  
  realtimeChannel.on(
    'postgres_changes',
    { event: '*', schema: 'public' },
    (payload: any) => {
      console.log('🔄 [Alico Realtime] Cambio detectado en la nube:', payload);
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
  return memoryDb;
};

export const saveMockData = (newData: Partial<MockDataStore>): void => {
  if (isMockMode) {
    activeSyncsCount++;
    let syncQueue = Promise.resolve();

    if (newData.sedes) {
      setLocalStorage('alico_sedes', newData.sedes);
      memoryDb.sedes = newData.sedes;
      syncQueue = syncQueue.then(() => syncTableToSupabase('sedes')) as Promise<void>;
    }
    if (newData.insumos) {
      setLocalStorage('alico_insumos', newData.insumos);
      memoryDb.insumos = newData.insumos;
      syncQueue = syncQueue.then(() => syncTableToSupabase('insumos')) as Promise<void>;
    }
    if (newData.productos) {
      setLocalStorage('alico_productos', newData.productos);
      memoryDb.productos = newData.productos;
      syncQueue = syncQueue.then(() => syncTableToSupabase('productos')) as Promise<void>;
    }
    if (newData.mesas) {
      setLocalStorage('alico_mesas', newData.mesas);
      memoryDb.mesas = newData.mesas;
      syncQueue = syncQueue.then(() => syncTableToSupabase('mesas')) as Promise<void>;
    }
    if (newData.movimientos) {
      setLocalStorage('alico_movimientos', newData.movimientos);
      memoryDb.movimientos = newData.movimientos;
      syncQueue = syncQueue.then(() => syncTableToSupabase('movimientos')) as Promise<void>;
    }
    if (newData.ventas) {
      setLocalStorage('alico_ventas', newData.ventas);
      memoryDb.ventas = newData.ventas;
      syncQueue = syncQueue.then(() => syncTableToSupabase('ventas')) as Promise<void>;
    }
    if (newData.creditos) {
      setLocalStorage('alico_creditos', newData.creditos);
      memoryDb.creditos = newData.creditos;
      syncQueue = syncQueue.then(() => syncTableToSupabase('creditos')) as Promise<void>;
    }
    if (newData.prestamos) {
      setLocalStorage('alico_prestamos', newData.prestamos);
      memoryDb.prestamos = newData.prestamos;
      syncQueue = syncQueue.then(() => syncTableToSupabase('prestamos')) as Promise<void>;
    }
    if (newData.cierres) {
      setLocalStorage('alico_cierres', newData.cierres);
      memoryDb.cierres = newData.cierres;
      syncQueue = syncQueue.then(() => syncTableToSupabase('cierres')) as Promise<void>;
    }
    if (newData.auditoria) {
      setLocalStorage('alico_auditoria', newData.auditoria);
      memoryDb.auditoria = newData.auditoria;
      syncQueue = syncQueue.then(() => syncTableToSupabase('auditoria')) as Promise<void>;
    }

    syncQueue.finally(() => {
      setTimeout(() => {
        activeSyncsCount = Math.max(0, activeSyncsCount - 1);
      }, 800);
    });
  }
};

// ==========================================
// MOCK STATE ACTIONS
// ==========================================
const runAsyncSupabase = (fn: () => Promise<any>) => {
  if (isMockMode || !supabase) return;
  fn().catch(err => {
    console.error('❌ [Alico Supabase Direct Action Error]:', err);
  });
};

export const mockDb = {
  getSedes: (): Sede[] => {
    const sedes = getMockData().sedes;
    return sedes.filter(s => s.id !== 'sede-centro');
  },
  addSede: (sede: Omit<Sede, 'id'>): Sede => {
    const newId = 'sede-' + Date.now();
    const newSede: Sede = { id: newId, ...sede };
    memoryDb.sedes.push(newSede);
    
    if (isMockMode) {
      saveMockData({ sedes: memoryDb.sedes });
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('sedes').insert(newSede);
      });
    }
    return newSede;
  },

  // --- INSUMOS ---
  getInsumos: (sedeId?: string): Insumo[] => {
    const insumos = getMockData().insumos;
    return sedeId ? insumos.filter(i => i.sede_id === sedeId) : insumos;
  },
  saveInsumo: (insumo: Partial<Insumo> & { sede_id: string; nombre: string; stock_actual: number; unidad: string }): Insumo => {
    let result: Insumo;
    if (insumo.id) {
      const idx = memoryDb.insumos.findIndex(i => i.id === insumo.id);
      if (idx !== -1) {
        memoryDb.insumos[idx] = { ...memoryDb.insumos[idx], ...insumo } as Insumo;
        result = memoryDb.insumos[idx];
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
      memoryDb.insumos.push(newInsumo);
      result = newInsumo;
    }
    
    if (isMockMode) {
      saveMockData({ insumos: memoryDb.insumos });
    } else {
      runAsyncSupabase(async () => {
        const { creado_en, ...payload } = result as any;
        await supabase!.from('insumos').upsert(payload);
      });
    }
    return result;
  },
  deleteInsumo: (id: string, usuario?: string): boolean => {
    const ins = memoryDb.insumos.find(i => i.id === id);
    const insNombre = ins ? ins.nombre : id;
    const SedeId = ins ? ins.sede_id : 'sede-norte';
    
    memoryDb.insumos = memoryDb.insumos.filter(i => i.id !== id);
    if (isMockMode) {
      saveMockData({ insumos: memoryDb.insumos });
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('insumos').delete().eq('id', id);
      });
    }
    
    mockDb.registrarAuditLog(
      SedeId,
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
    let result: Producto;
    let newMovement: Movimiento | null = null;
    
    if (prod.id) {
      const idx = memoryDb.productos.findIndex(p => p.id === prod.id);
      if (idx !== -1) {
        const oldStock = memoryDb.productos[idx].stock_actual;
        const diff = prod.stock_actual - oldStock;
        if (diff !== 0) {
          const type = diff > 0 ? 'INGRESO' : 'EGRESO';
          newMovement = {
            id: 'mov-' + Date.now(),
            producto_id: prod.id,
            producto_nombre: prod.nombre,
            sede_id: prod.sede_id,
            tipo: type,
            cantidad: Math.abs(diff),
            motivo: 'Ajuste manual de inventario',
            registrado_por: prod.registrado_por || 'Sistema',
            fecha_hora: new Date().toISOString()
          };
          memoryDb.movimientos.unshift(newMovement);
        }
        memoryDb.productos[idx] = { ...memoryDb.productos[idx], ...prod } as Producto;
        result = memoryDb.productos[idx];
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
      memoryDb.productos.push(newProd);
      
      newMovement = {
        id: 'mov-' + Date.now(),
        producto_id: newId,
        producto_nombre: newProd.nombre,
        sede_id: newProd.sede_id,
        tipo: 'INGRESO',
        cantidad: newProd.stock_actual,
        motivo: 'Registro inicial de producto',
        registrado_por: prod.registrado_por || 'Sistema',
        fecha_hora: new Date().toISOString()
      };
      memoryDb.movimientos.unshift(newMovement);
      result = newProd;
    }
    
    if (isMockMode) {
      saveMockData({ productos: memoryDb.productos, movimientos: memoryDb.movimientos });
    } else {
      runAsyncSupabase(async () => {
        const { registrado_por, creado_en, ...prodPayload } = result as any;
        await supabase!.from('productos').upsert(prodPayload);
        if (newMovement) {
          const { creado_en: movC, ...movPayload } = newMovement as any;
          await supabase!.from('movimientos').insert(movPayload);
        }
      });
    }
    return result;
  },
  deleteProducto: (id: string, usuario?: string): boolean => {
    const prod = memoryDb.productos.find(p => p.id === id);
    const prodNombre = prod ? prod.nombre : id;
    const SedeId = prod ? prod.sede_id : 'sede-norte';
    
    memoryDb.productos = memoryDb.productos.filter(p => p.id !== id);
    if (isMockMode) {
      saveMockData({ productos: memoryDb.productos });
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('productos').delete().eq('id', id);
      });
    }
    
    mockDb.registrarAuditLog(
      SedeId,
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
    const idx = memoryDb.mesas.findIndex(m => m.id === mesaId);
    if (idx !== -1) {
      const mesa = memoryDb.mesas[idx];
      mesa.estado = estado;
      if (estado === 'DISPONIBLE') {
        mesa.cliente_nombre = '';
        mesa.consumos = [];
      } else if (nuevaMesa) {
        mesa.numero_mesa = nuevaMesa.numero_mesa || mesa.numero_mesa;
        mesa.cliente_nombre = nuevaMesa.cliente_nombre || mesa.cliente_nombre;
      }
      
      if (isMockMode) {
        saveMockData({ mesas: memoryDb.mesas });
      } else {
        runAsyncSupabase(async () => {
          const { creado_en, ...payload } = mesa as any;
          await supabase!.from('mesas').upsert(payload);
        });
      }
      return mesa;
    }
    return null;
  },
  liberarMesaTotalmente: (mesaId: string, atendidoPor: string): Mesa | null => {
    const idx = memoryDb.mesas.findIndex(m => m.id === mesaId);
    if (idx !== -1) {
      const mesa = memoryDb.mesas[idx];
      
      const newMovements: Movimiento[] = [];
      
      mesa.consumos.forEach(cons => {
        const prodIdx = memoryDb.productos.findIndex(p => p.id === cons.producto_id);
        if (prodIdx !== -1) {
          const prodActual = memoryDb.productos[prodIdx];
          if (prodActual.tiene_receta) {
             mockDb._reintegrarInsumosReceta(memoryDb, prodActual, cons.cantidad);
          } else {
            prodActual.stock_actual += cons.cantidad;
          }
          
          const newMov: Movimiento = {
            id: 'mov-' + Date.now() + '-' + cons.producto_id,
            producto_id: cons.producto_id,
            producto_nombre: cons.nombre,
            sede_id: mesa.sede_id,
            tipo: 'INGRESO',
            cantidad: cons.cantidad,
            motivo: `Cancelación (liberación) de consumo en Mesa ${mesa.numero_mesa}`,
            registrado_por: atendidoPor,
            fecha_hora: new Date().toISOString()
          };
          newMovements.push(newMov);
          memoryDb.movimientos.unshift(newMov);
        }
      });
      
      mesa.estado = 'DISPONIBLE';
      mesa.cliente_nombre = '';
      mesa.consumos = [];
      
      if (isMockMode) {
        saveMockData({ mesas: memoryDb.mesas, productos: memoryDb.productos, insumos: memoryDb.insumos, movimientos: memoryDb.movimientos });
      } else {
        runAsyncSupabase(async () => {
          const { creado_en, ...payload } = mesa as any;
          await supabase!.from('mesas').upsert(payload);
          
          for (const prod of memoryDb.productos) {
            const { registrado_por, creado_en: pC, ...prodPayload } = prod as any;
            await supabase!.from('productos').upsert(prodPayload);
          }
          for (const ins of memoryDb.insumos) {
            const { creado_en: iC, ...insPayload } = ins as any;
            await supabase!.from('insumos').upsert(insPayload);
          }
          for (const mov of newMovements) {
            const { creado_en: mC, ...movPayload } = mov as any;
            await supabase!.from('movimientos').insert(movPayload);
          }
        });
      }
      return mesa;
    }
    return null;
  },

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
    const mesaIdx = memoryDb.mesas.findIndex(m => m.id === mesaId);
    if (mesaIdx !== -1) {
      const mesa = memoryDb.mesas[mesaIdx];
      const prodIdx = memoryDb.productos.findIndex(p => p.id === consumo.producto_id);
      let newMovement: Movimiento | null = null;
      
      if (prodIdx !== -1) {
        const prodActual = memoryDb.productos[prodIdx];
        
        if (prodActual.stock_actual < consumo.cantidad) {
          throw new Error(`Stock insuficiente de ${prodActual.nombre}. Solo quedan ${prodActual.stock_actual} unidades.`);
        }

        if (prodActual.tiene_receta) {
          mockDb._descontarInsumosReceta(memoryDb, prodActual, consumo.cantidad);
        }

        prodActual.stock_actual -= consumo.cantidad;
        newMovement = {
          id: 'mov-' + Date.now(),
          producto_id: prodActual.id,
          producto_nombre: prodActual.nombre,
          sede_id: mesa.sede_id,
          tipo: 'EGRESO',
          cantidad: consumo.cantidad,
          motivo: `Consumo en ${mesa.numero_mesa}`,
          registrado_por: consumo.registrado_por,
          fecha_hora: new Date().toISOString()
        };
        memoryDb.movimientos.unshift(newMovement);
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
      
      if (isMockMode) {
        saveMockData({ mesas: memoryDb.mesas, productos: memoryDb.productos, movimientos: memoryDb.movimientos, insumos: memoryDb.insumos });
      } else {
        runAsyncSupabase(async () => {
          const { creado_en, ...payload } = mesa as any;
          await supabase!.from('mesas').upsert(payload);
          
          if (prodIdx !== -1) {
            const prodActual = memoryDb.productos[prodIdx];
            const { registrado_por, creado_en: pC, ...prodPayload } = prodActual as any;
            await supabase!.from('productos').upsert(prodPayload);
            
            if (prodActual.tiene_receta && prodActual.receta) {
              for (const itemRec of prodActual.receta) {
                const ins = memoryDb.insumos.find(i => i.id === itemRec.insumo_id);
                if (ins) {
                  const { creado_en: iC, ...insPayload } = ins as any;
                  await supabase!.from('insumos').upsert(insPayload);
                }
              }
            }
          }
          if (newMovement) {
            const { creado_en: mC, ...movPayload } = newMovement as any;
            await supabase!.from('movimientos').insert(movPayload);
          }
        });
      }
      return mesa;
    }
    return null;
  },

  cancelarConsumoMesa: (mesaId: string, consumoId: string, atendidoPor: string): Mesa | null => {
    const mesaIdx = memoryDb.mesas.findIndex(m => m.id === mesaId);
    if (mesaIdx !== -1) {
      const mesa = memoryDb.mesas[mesaIdx];
      const consIdx = mesa.consumos.findIndex(c => c.id === consumoId);
      if (consIdx !== -1) {
        const cons = mesa.consumos[consIdx];
        let newMovement: Movimiento | null = null;
        
        const prodIdx = memoryDb.productos.findIndex(p => p.id === cons.producto_id);
        if (prodIdx !== -1) {
          const prodActual = memoryDb.productos[prodIdx];
          
          if (prodActual.tiene_receta) {
             mockDb._reintegrarInsumosReceta(memoryDb, prodActual, cons.cantidad);
          }
          
          prodActual.stock_actual += cons.cantidad;
          newMovement = {
            id: 'mov-' + Date.now(),
            producto_id: cons.producto_id,
            producto_nombre: cons.nombre,
            sede_id: mesa.sede_id,
            tipo: 'INGRESO',
            cantidad: cons.cantidad,
            motivo: `Cancelación/Reintegro de consumo de ${mesa.numero_mesa}`,
            registrado_por: atendidoPor,
            fecha_hora: new Date().toISOString()
          };
          memoryDb.movimientos.unshift(newMovement);
        }

        mesa.consumos.splice(consIdx, 1);
        if (mesa.consumos.length === 0) {
          mesa.estado = 'DISPONIBLE';
          mesa.cliente_nombre = '';
        }
        
        if (isMockMode) {
          saveMockData({ mesas: memoryDb.mesas, productos: memoryDb.productos, movimientos: memoryDb.movimientos, insumos: memoryDb.insumos });
        } else {
          runAsyncSupabase(async () => {
            const { creado_en, ...payload } = mesa as any;
            await supabase!.from('mesas').upsert(payload);
            
            if (prodIdx !== -1) {
              const prodActual = memoryDb.productos[prodIdx];
              const { registrado_por, creado_en: pC, ...prodPayload } = prodActual as any;
              await supabase!.from('productos').upsert(prodPayload);
              
              if (prodActual.tiene_receta && prodActual.receta) {
                for (const itemRec of prodActual.receta) {
                  const ins = memoryDb.insumos.find(i => i.id === itemRec.insumo_id);
                  if (ins) {
                    const { creado_en: iC, ...insPayload } = ins as any;
                    await supabase!.from('insumos').upsert(insPayload);
                  }
                }
              }
            }
            if (newMovement) {
              const { creado_en: mC, ...movPayload } = newMovement as any;
              await supabase!.from('movimientos').insert(movPayload);
            }
          });
        }
        return mesa;
      }
    }
    return null;
  },

  // --- MOVIMIENTOS ---
  getMovimientos: (sedeId?: string): Movimiento[] => {
    const movs = getMockData().movimientos;
    return sedeId ? movs.filter(m => m.sede_id === sedeId) : movs;
  },

  // --- CATEGORIAS ---
  getCategorias: (): string[] => {
    return categories;
  },
  addCategoria: (categoria: string): string[] => {
    const cleanCat = categoria.trim();
    if (cleanCat && !categories.some(c => c.toLowerCase() === cleanCat.toLowerCase())) {
      categories.push(cleanCat);
      if (isMockMode) {
        setLocalStorage('alico_categorias', categories);
      }
    }
    return categories;
  },
  deleteCategoria: (categoria: string): string[] => {
    const idx = categories.indexOf(categoria);
    if (idx !== -1) {
      categories.splice(idx, 1);
      if (isMockMode) {
        setLocalStorage('alico_categorias', categories);
      }
    }
    return categories;
  },

  // --- VENTAS ---
  getVentas: (sedeId?: string): Venta[] => {
    const ventas = getMockData().ventas;
    return sedeId ? ventas.filter(v => v.sede_id === sedeId) : ventas;
  },
  registrarVenta: (venta: Omit<Venta, 'id' | 'fecha_hora'> & { es_directa?: boolean }): Venta => {
    const newVenta: Venta = {
      id: 'v-' + Date.now(),
      fecha_hora: new Date().toISOString(),
      estado: 'COMPLETADA',
      ...venta
    };

    const updatedProds: Producto[] = [];
    const updatedInsumos: Insumo[] = [];
    const newMovs: Movimiento[] = [];
    let newCredito: CreditoCliente | null = null;

    if (venta.es_directa) {
      newVenta.items.forEach(item => {
        const prodIdx = memoryDb.productos.findIndex(p => p.id === item.producto_id);
        if (prodIdx !== -1) {
          const prodActual = memoryDb.productos[prodIdx];
          
          if (prodActual.stock_actual < item.cantidad) {
            throw new Error(`Stock insuficiente para ${item.nombre}.`);
          }

          if (prodActual.tiene_receta) {
             mockDb._descontarInsumosReceta(memoryDb, prodActual, item.cantidad);
             prodActual.receta?.forEach(rItem => {
               const ins = memoryDb.insumos.find(i => i.id === rItem.insumo_id);
               if (ins && !updatedInsumos.includes(ins)) updatedInsumos.push(ins);
             });
          }

          prodActual.stock_actual -= item.cantidad;
          updatedProds.push(prodActual);
          
          const newMov: Movimiento = {
            id: 'mov-' + Date.now() + '-' + item.producto_id,
            producto_id: item.producto_id,
            producto_nombre: item.nombre,
            sede_id: venta.sede_id,
            tipo: 'EGRESO',
            cantidad: item.cantidad,
            motivo: 'Venta Directa POS',
            registrado_por: venta.atendido_por,
            fecha_hora: new Date().toISOString()
          };
          newMovs.push(newMov);
          memoryDb.movimientos.unshift(newMov);
        }
      });
    }

    if (venta.metodo_pago === 'CREDITO') {
      if (!venta.cliente_nombre || venta.cliente_nombre.trim() === 'Cliente General') {
        throw new Error('Debe especificar el nombre real del cliente para registrar una venta a crédito.');
      }
      newCredito = {
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
      memoryDb.creditos.unshift(newCredito);
    }

    memoryDb.ventas.unshift(newVenta);
    
    if (isMockMode) {
      saveMockData({ 
        ventas: memoryDb.ventas, 
        productos: memoryDb.productos, 
        movimientos: memoryDb.movimientos, 
        insumos: memoryDb.insumos, 
        creditos: memoryDb.creditos 
      });
    } else {
      runAsyncSupabase(async () => {
        const { creado_en, ...ventaPayload } = newVenta as any;
        await supabase!.from('ventas').insert(ventaPayload);

        for (const prod of updatedProds) {
          const { registrado_por, creado_en: pC, ...prodPayload } = prod as any;
          await supabase!.from('productos').upsert(prodPayload);
        }

        for (const ins of updatedInsumos) {
          const { creado_en: iC, ...insPayload } = ins as any;
          await supabase!.from('insumos').upsert(insPayload);
        }

        for (const mov of newMovs) {
          const { creado_en: mC, ...movPayload } = mov as any;
          await supabase!.from('movimientos').insert(movPayload);
        }

        if (newCredito) {
          const { creado_en: crC, ...credPayload } = newCredito as any;
          await supabase!.from('creditos').insert(credPayload);
        }
      });
    }
    return newVenta;
  },
  anularVenta: (ventaId: string, razonAnulacion: string, atendidoPor: string, usuario?: string): Venta | null => {
    const vIdx = memoryDb.ventas.findIndex(v => v.id === ventaId);
    if (vIdx !== -1) {
      const venta = memoryDb.ventas[vIdx];
      if (venta.estado === 'ANULADA') return null;

      const updatedProds: Producto[] = [];
      const updatedInsumos: Insumo[] = [];
      const newMovs: Movimiento[] = [];

      // Reintegrar inventario
      venta.items.forEach(item => {
        const prodIdx = memoryDb.productos.findIndex(p => p.id === item.producto_id);
        if (prodIdx !== -1) {
          const prodActual = memoryDb.productos[prodIdx];
          if (prodActual.tiene_receta) {
             mockDb._reintegrarInsumosReceta(memoryDb, prodActual, item.cantidad);
             prodActual.receta?.forEach(rItem => {
               const ins = memoryDb.insumos.find(i => i.id === rItem.insumo_id);
               if (ins && !updatedInsumos.includes(ins)) updatedInsumos.push(ins);
             });
          }
          
          prodActual.stock_actual += item.cantidad;
          updatedProds.push(prodActual);

          const newMov: Movimiento = {
            id: 'mov-anu-' + Date.now() + '-' + item.producto_id,
            producto_id: prodActual.id,
            producto_nombre: prodActual.nombre,
            sede_id: venta.sede_id,
            tipo: 'INGRESO',
            cantidad: item.cantidad,
            motivo: `Anulación de Venta: ${razonAnulacion}`,
            registrado_por: atendidoPor,
            fecha_hora: new Date().toISOString()
          };
          newMovs.push(newMov);
          memoryDb.movimientos.unshift(newMov);
        }
      });

      venta.estado = 'ANULADA';
      venta.razon_anulacion = razonAnulacion;
      
      if (isMockMode) {
        saveMockData({ 
          ventas: memoryDb.ventas, 
          productos: memoryDb.productos, 
          movimientos: memoryDb.movimientos, 
          insumos: memoryDb.insumos 
        });
      } else {
        runAsyncSupabase(async () => {
          await supabase!.from('ventas').update({
            estado: 'ANULADA',
            razon_anulacion: razonAnulacion
          }).eq('id', ventaId);

          for (const prod of updatedProds) {
            const { registrado_por, creado_en: pC, ...prodPayload } = prod as any;
            await supabase!.from('productos').upsert(prodPayload);
          }

          for (const ins of updatedInsumos) {
            const { creado_en: iC, ...insPayload } = ins as any;
            await supabase!.from('insumos').upsert(insPayload);
          }

          for (const mov of newMovs) {
            const { creado_en: mC, ...movPayload } = mov as any;
            await supabase!.from('movimientos').insert(movPayload);
          }
        });
      }
      
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

  // --- CREDITOS ---
  getCreditos: (sedeId?: string): CreditoCliente[] => {
    const creditos = getMockData().creditos;
    return sedeId ? creditos.filter(c => c.sede_id === sedeId) : creditos;
  },
  registrarCreditoManual: (credito: Omit<CreditoCliente, 'id' | 'fecha_registro' | 'estado' | 'total_pagado'>): CreditoCliente => {
    const newCredito: CreditoCliente = {
      id: 'cr-' + Date.now(),
      fecha_registro: new Date().toISOString(),
      total_pagado: 0,
      estado: 'PENDIENTE',
      ...credito
    };
    memoryDb.creditos.unshift(newCredito);
    
    if (isMockMode) {
      saveMockData({ creditos: memoryDb.creditos });
    } else {
      runAsyncSupabase(async () => {
        const { creado_en, ...payload } = newCredito as any;
        await supabase!.from('creditos').insert(payload);
      });
    }
    return newCredito;
  },
  registrarAbonoCredito: (creditoId: string, montoAbono: number): CreditoCliente | null => {
    const idx = memoryDb.creditos.findIndex(c => c.id === creditoId);
    if (idx !== -1) {
      const cred = memoryDb.creditos[idx];
      const nuevoTotalPagado = cred.total_pagado + montoAbono;
      cred.total_pagado = Math.min(cred.total_deuda, nuevoTotalPagado);
      if (cred.total_pagado >= cred.total_deuda) {
        cred.estado = 'PAGADO';
        cred.fecha_pago = new Date().toISOString();
      }
      
      if (isMockMode) {
        saveMockData({ creditos: memoryDb.creditos });
      } else {
        runAsyncSupabase(async () => {
          await supabase!.from('creditos').update({
            total_pagado: cred.total_pagado,
            estado: cred.estado,
            fecha_pago: cred.fecha_pago || null
          }).eq('id', creditoId);
        });
      }
      return cred;
    }
    return null;
  },

  // --- PRESTAMOS ---
  getPrestamos: (sedeId?: string): PrestamoBotella[] => {
    const prestamos = getMockData().prestamos;
    return sedeId ? prestamos.filter(p => p.sede_id === sedeId) : prestamos;
  },
  registrarPrestamo: (prestamo: Omit<PrestamoBotella, 'id' | 'fecha_prestamo' | 'estado'> & { descontarStock?: boolean }): PrestamoBotella => {
    const newId = 'pr-' + Date.now();
    const newPrestamo: PrestamoBotella = {
      id: newId,
      fecha_prestamo: new Date().toISOString(),
      estado: 'PENDIENTE',
      ...prestamo
    };
    
    let prodActual: Producto | null = null;
    let newMovement: Movimiento | null = null;

    if (prestamo.descontarStock && prestamo.producto_id) {
      const prodIdx = memoryDb.productos.findIndex(p => p.id === prestamo.producto_id);
      if (prodIdx !== -1) {
        prodActual = memoryDb.productos[prodIdx];
        if (prodActual.stock_actual < prestamo.cantidad) {
          throw new Error(`Stock insuficiente para prestar ${prestamo.botella_nombre}. Solo quedan ${prodActual.stock_actual} unidades.`);
        }
        prodActual.stock_actual -= prestamo.cantidad;
        
        newMovement = {
          id: 'mov-' + Date.now() + '-' + prestamo.producto_id,
          producto_id: prestamo.producto_id,
          producto_nombre: prestamo.botella_nombre,
          sede_id: prestamo.sede_id,
          tipo: 'EGRESO',
          cantidad: prestamo.cantidad,
          motivo: `Préstamo de botellas a ${prestamo.cliente_nombre}`,
          registrado_por: prestamo.registrado_por,
          fecha_hora: new Date().toISOString()
        };
        memoryDb.movimientos.unshift(newMovement);
      }
    }

    memoryDb.prestamos.unshift(newPrestamo);
    
    if (isMockMode) {
      saveMockData({ prestamos: memoryDb.prestamos, productos: memoryDb.productos, movimientos: memoryDb.movimientos });
    } else {
      runAsyncSupabase(async () => {
        const { descontó_stock, creado_en, ...payload } = newPrestamo as any;
        await supabase!.from('prestamos').insert({
          ...payload,
          desconto_stock: descontó_stock ?? false
        });
        
        if (prodActual) {
          const { registrado_por, creado_en: prodC, ...prodPayload } = prodActual as any;
          await supabase!.from('productos').upsert(prodPayload);
        }
        
        if (newMovement) {
          const { creado_en: movC, ...movPayload } = newMovement as any;
          await supabase!.from('movimientos').insert(movPayload);
        }
      });
    }
    return newPrestamo;
  },
  devolverPrestamo: (prestamoId: string, reintegrarStock?: boolean): PrestamoBotella | null => {
    const idx = memoryDb.prestamos.findIndex(p => p.id === prestamoId);
    if (idx !== -1) {
      const prestamo = memoryDb.prestamos[idx];
      prestamo.estado = 'DEVUELTO';
      prestamo.fecha_devolucion = new Date().toISOString();
      
      let prodActual: Producto | null = null;
      let newMovement: Movimiento | null = null;

      if (reintegrarStock && prestamo.producto_id) {
        const prodIdx = memoryDb.productos.findIndex(p => p.id === prestamo.producto_id);
        if (prodIdx !== -1) {
          prodActual = memoryDb.productos[prodIdx];
          prodActual.stock_actual += prestamo.cantidad;
          
          newMovement = {
            id: 'mov-' + Date.now() + '-' + prestamo.producto_id,
            producto_id: prestamo.producto_id,
            producto_nombre: prestamo.botella_nombre,
            sede_id: prestamo.sede_id,
            tipo: 'INGRESO',
            cantidad: prestamo.cantidad,
            motivo: `Devolución de botellas prestadas por ${prestamo.cliente_nombre}`,
            registrado_por: prestamo.registrado_por || 'Sistema',
            fecha_hora: new Date().toISOString()
          };
          memoryDb.movimientos.unshift(newMovement);
        }
      }

      if (isMockMode) {
        saveMockData({ prestamos: memoryDb.prestamos, productos: memoryDb.productos, movimientos: memoryDb.movimientos });
      } else {
        runAsyncSupabase(async () => {
          await supabase!.from('prestamos').update({
            estado: 'DEVUELTO',
            fecha_devolucion: prestamo.fecha_devolucion
          }).eq('id', prestamoId);
          
          if (prodActual) {
            const { registrado_por, creado_en: prodC, ...prodPayload } = prodActual as any;
            await supabase!.from('productos').upsert(prodPayload);
          }
          
          if (newMovement) {
            const { creado_en: movC, ...movPayload } = newMovement as any;
            await supabase!.from('movimientos').insert(movPayload);
          }
        });
      }
      return prestamo;
    }
    return null;
  },
  eliminarPrestamo: (prestamoId: string, usuario?: string): boolean => {
    const pr = memoryDb.prestamos.find(p => p.id === prestamoId);
    const detalle = pr ? `Préstamo de ${pr.cantidad} botellas de ${pr.botella_nombre} al cliente ${pr.cliente_nombre}.` : prestamoId;
    const SedeId = pr ? pr.sede_id : 'sede-norte';
    
    memoryDb.prestamos = memoryDb.prestamos.filter(p => p.id !== prestamoId);
    
    if (isMockMode) {
      saveMockData({ prestamos: memoryDb.prestamos });
      deleteFromSupabase('prestamos', prestamoId);
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('prestamos').delete().eq('id', prestamoId);
      });
    }
    
    mockDb.registrarAuditLog(
      SedeId,
      usuario || 'Administrador',
      'ELIMINAR_PRESTAMO',
      `Eliminó un registro de préstamo del historial: ${detalle}`
    );
    return true;
  },
  limpiarPrestamosDevueltos: (sedeId: string, usuario?: string): boolean => {
    const devueltosSede = memoryDb.prestamos.filter(p => p.sede_id === sedeId && p.estado === 'DEVUELTO');
    if (devueltosSede.length === 0) return false;
    
    const cantidad = devueltosSede.reduce((sum, p) => sum + p.cantidad, 0);
    memoryDb.prestamos = memoryDb.prestamos.filter(p => !(p.sede_id === sedeId && p.estado === 'DEVUELTO'));
    
    if (isMockMode) {
      saveMockData({ prestamos: memoryDb.prestamos });
    }
    
    runAsyncSupabase(async () => {
      await supabase!.from('prestamos').delete().eq('sede_id', sedeId).eq('estado', 'DEVUELTO');
    });
    
    mockDb.registrarAuditLog(
      sedeId,
      usuario || 'Administrador',
      'LIMPIAR_PRESTAMOS_DEVUELTOS',
      `Limpió todos los envases marcados como DEVUELTOS del historial (Total: ${devueltosSede.length} registros, ${cantidad} botellas).`
    );
    return true;
  },
  limpiarCreditosPagados: (sedeId: string, usuario?: string): boolean => {
    const pagadosSede = memoryDb.creditos.filter(c => c.sede_id === sedeId && c.estado === 'PAGADO');
    if (pagadosSede.length === 0) return false;
    
    const montoTotal = pagadosSede.reduce((sum, c) => sum + c.total_deuda, 0);
    memoryDb.creditos = memoryDb.creditos.filter(c => !(c.sede_id === sedeId && c.estado === 'PAGADO'));
    
    if (isMockMode) {
      saveMockData({ creditos: memoryDb.creditos });
    }
    
    runAsyncSupabase(async () => {
      await supabase!.from('creditos').delete().eq('sede_id', sedeId).eq('estado', 'PAGADO');
    });
    
    mockDb.registrarAuditLog(
      sedeId,
      usuario || 'Administrador',
      'LIMPIAR_CREDITOS_PAGADOS',
      `Limpió todos los créditos marcados como PAGADOS del historial (Total: ${pagadosSede.length} cuentas, Monto: $${montoTotal.toLocaleString('es-CO')}).`
    );
    return true;
  },

  // --- CIERRES DE CAJA ---
  getCierres: (sedeId?: string): CierreCaja[] => {
    const cierres = getMockData().cierres;
    return /^\s*$/.test(sedeId || '') ? cierres : cierres.filter(c => c.sede_id === sedeId);
  },
  registrarCierre: (cierre: Omit<CierreCaja, 'id' | 'fecha_hora'>): CierreCaja => {
    const newCierre: CierreCaja = {
      id: 'cierre-' + Date.now(),
      fecha_hora: new Date().toISOString(),
      ...cierre
    };
    memoryDb.cierres.unshift(newCierre);
    
    if (isMockMode) {
      saveMockData({ cierres: memoryDb.cierres });
    } else {
      runAsyncSupabase(async () => {
        const { creado_en, ...payload } = newCierre as any;
        await supabase!.from('cierres').insert(payload);
      });
    }
    return newCierre;
  },

  // --- AUDITORIA ---
  registrarAuditLog: (sedeId: string, usuario: string, accion: string, detalle: string): AuditLog => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      sede_id: sedeId,
      usuario: usuario || 'Sistema',
      accion: accion,
      detalle: detalle,
      fecha_hora: new Date().toISOString()
    };
    memoryDb.auditoria = memoryDb.auditoria || [];
    memoryDb.auditoria.unshift(newLog);
    
    if (isMockMode) {
      saveMockData({ auditoria: memoryDb.auditoria });
    } else {
      (async () => {
        try {
          if (supabase) {
            const { creado_en, ...payload } = newLog as any;
            await supabase.from('auditoria').insert(payload);
          }
        } catch (e) {
          console.warn('⚠️ [Alico Supabase] La tabla auditoria no existe. Registrado en memoria.');
        }
      })();
    }
    return newLog;
  },
  getAuditLogs: (sedeId?: string): AuditLog[] => {
    const logs = memoryDb.auditoria || [];
    return sedeId ? logs.filter(l => l.sede_id === sedeId) : logs;
  },

  eliminarVenta: (id: string, usuario?: string): boolean => {
    const v = memoryDb.ventas.find(x => x.id === id);
    const detalle = v ? `Venta por valor de $${v.total.toLocaleString('es-CO')} a ${v.cliente_nombre}.` : id;
    const SedeId = v ? v.sede_id : 'sede-norte';
    
    // Si la venta era a crédito, eliminar también el crédito asociado si existe
    if (v && v.metodo_pago === 'CREDITO') {
      const associatedCred = memoryDb.creditos.find(c => c.venta_id === id);
      if (associatedCred) {
        memoryDb.creditos = memoryDb.creditos.filter(c => c.id !== associatedCred.id);
        if (isMockMode) {
          saveMockData({ creditos: memoryDb.creditos });
        } else {
          runAsyncSupabase(async () => {
            await supabase!.from('creditos').delete().eq('venta_id', id);
          });
        }
        mockDb.registrarAuditLog(
          SedeId,
          usuario || 'Super Admin',
          'ELIMINAR_CREDITO_ASOCIADO',
          `Eliminó automáticamente el crédito asociado al eliminar la venta #${id}.`
        );
      }
    }

    memoryDb.ventas = memoryDb.ventas.filter(x => x.id !== id);
    
    if (isMockMode) {
      saveMockData({ ventas: memoryDb.ventas });
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('ventas').delete().eq('id', id);
      });
    }
    
    mockDb.registrarAuditLog(
      SedeId,
      usuario || 'Super Admin',
      'ELIMINAR_VENTA',
      `Eliminó permanentemente un registro de venta del historial: ${detalle}`
    );
    return true;
  },

  eliminarCredito: (id: string, usuario?: string): boolean => {
    const cred = memoryDb.creditos.find(c => c.id === id);
    const detalle = cred ? `Crédito de $${cred.total_deuda.toLocaleString('es-CO')} al cliente ${cred.cliente_nombre}.` : id;
    const SedeId = cred ? cred.sede_id : 'sede-norte';
    
    memoryDb.creditos = memoryDb.creditos.filter(c => c.id !== id);
    
    if (isMockMode) {
      saveMockData({ creditos: memoryDb.creditos });
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('creditos').delete().eq('id', id);
      });
    }
    
    mockDb.registrarAuditLog(
      SedeId,
      usuario || 'Super Admin',
      'ELIMINAR_CREDITO',
      `Eliminó un registro de crédito del historial: ${detalle}`
    );
    return true;
  },

  eliminarCierre: (id: string, usuario?: string): boolean => {
    const c = memoryDb.cierres.find(x => x.id === id);
    const detalle = c ? `Arqueo/Cierre de caja con total ventas $${c.ventas_total.toLocaleString('es-CO')} por ${c.registrado_por}.` : id;
    const SedeId = c ? c.sede_id : 'sede-norte';
    
    memoryDb.cierres = memoryDb.cierres.filter(x => x.id !== id);
    
    if (isMockMode) {
      saveMockData({ cierres: memoryDb.cierres });
    } else {
      runAsyncSupabase(async () => {
        await supabase!.from('cierres').delete().eq('id', id);
      });
    }
    
    mockDb.registrarAuditLog(
      SedeId,
      usuario || 'Super Admin',
      'ELIMINAR_CIERRE',
      `Eliminó permanentemente un arqueo de caja (cierre): ${detalle}`
    );
    return true;
  },

  // --- RESET/CLEAN DATA ---
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
    setLocalStorage('alico_categorias', ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios']);

    memoryDb = {
      sedes: INITIAL_SEDES,
      insumos: INITIAL_INSUMOS,
      productos: INITIAL_PRODUCTS,
      mesas: INITIAL_MESAS.map(m => ({ ...m, consumos: m.consumos || [] })),
      movimientos: INITIAL_MOVIMIENTOS,
      ventas: INITIAL_VENTAS,
      creditos: INITIAL_CREDITOS,
      prestamos: INITIAL_PRESTAMOS,
      cierres: [],
      auditoria: []
    };
    categories.splice(0, categories.length, 'Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios');

    if (!isMockMode && supabase) {
      try {
        await supabase.from('cierres').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('movimientos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('mesas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('insumos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sedes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('auditoria').delete().neq('id', '00000000-0000-0000-0000-000000000000');

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
    const clearedMesas = memoryDb.mesas.map(m => ({
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

    memoryDb.insumos = [];
    memoryDb.productos = [];
    memoryDb.mesas = clearedMesas;
    memoryDb.movimientos = [];
    memoryDb.ventas = [];
    memoryDb.creditos = [];
    memoryDb.prestamos = [];
    memoryDb.cierres = [];
    memoryDb.auditoria = [];
    categories.splice(0, categories.length, 'Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Comidas', 'Varios');

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
        await supabase.from('auditoria').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Error clear remote Supabase:', err);
      }
    }
  }
};
