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
  direccion: string;
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
}

export interface ConsumoItem {
  id: string;
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  registrado_por: string;
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

// ==========================================
// MOCK STATE INITIAL DATA
// ==========================================
const INITIAL_SEDES: Sede[] = [
  { id: 'sede-norte', nombre: 'Licorera & Bar Alico Norte', direccion: 'Av. Principal #102' },
  { id: 'sede-centro', nombre: 'Alico Express Centro', direccion: 'Calle 15 #5-40' }
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
  { id: 'p11', sede_id: 'sede-centro', codigo_barras: '770123456787', nombre: 'Gaseosa Coca-Cola 1.5L', categoria: 'Gaseosas', precio_compra: 4000, precio_venta: 6500, stock_actual: 14, stock_minimo: 10 }
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
  productos: Producto[];
  mesas: Mesa[];
  movimientos: Movimiento[];
  ventas: Venta[];
  creditos: CreditoCliente[];
  prestamos: PrestamoBotella[];
}

// ==========================================
// SUPABASE OFFLINE-FIRST SYNC ENGINE
// ==========================================
export const syncTableToSupabase = async (table: keyof MockDataStore) => {
  if (isMockMode || !supabase) return;
  try {
    const data = getMockData()[table];
    if (data.length > 0) {
      const { error } = await supabase.from(table).upsert(data as any);
      if (error) {
        console.error(`[Alico Sync] Error subiendo tabla ${table} a Supabase:`, error);
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

export const syncFromSupabase = async (): Promise<boolean> => {
  if (isMockMode || !supabase) return false;
  try {
    console.log('🔄 [Alico Sync] Descargando base de datos desde Supabase...');
    const [
      sedesRes,
      productosRes,
      mesasRes,
      movimientosRes,
      ventasRes,
      creditosRes,
      prestamosRes
    ] = await Promise.all([
      supabase.from('sedes').select('*'),
      supabase.from('productos').select('*'),
      supabase.from('mesas').select('*'),
      supabase.from('movimientos').select('*'),
      supabase.from('ventas').select('*'),
      supabase.from('creditos').select('*'),
      supabase.from('prestamos').select('*')
    ]);

    if (sedesRes.error) throw sedesRes.error;
    if (productosRes.error) throw productosRes.error;
    if (mesasRes.error) throw mesasRes.error;
    if (movimientosRes.error) throw movimientosRes.error;
    if (ventasRes.error) throw ventasRes.error;
    if (creditosRes.error) throw creditosRes.error;
    if (prestamosRes.error) throw prestamosRes.error;

    // Actualizar caché local instantáneamente
    setLocalStorage('alico_sedes', sedesRes.data || []);
    setLocalStorage('alico_productos', productosRes.data || []);
    setLocalStorage('alico_mesas', mesasRes.data || []);
    setLocalStorage('alico_movimientos', movimientosRes.data || []);
    setLocalStorage('alico_ventas', ventasRes.data || []);
    setLocalStorage('alico_creditos', creditosRes.data || []);
    setLocalStorage('alico_prestamos', prestamosRes.data || []);

    console.log('🟢 [Alico Sync] Base de datos local sincronizada con la nube.');
    window.dispatchEvent(new Event('supabase_synced'));
    return true;
  } catch (err) {
    console.error('❌ [Alico Sync] Error de red al sincronizar desde Supabase. Usando caché local offline:', err);
    return false;
  }
};

export const getMockData = (): MockDataStore => {
  return {
    sedes: getLocalStorage<Sede[]>('alico_sedes', INITIAL_SEDES),
    productos: getLocalStorage<Producto[]>('alico_productos', INITIAL_PRODUCTS),
    mesas: getLocalStorage<Mesa[]>('alico_mesas', INITIAL_MESAS),
    movimientos: getLocalStorage<Movimiento[]>('alico_movimientos', INITIAL_MOVIMIENTOS),
    ventas: getLocalStorage<Venta[]>('alico_ventas', INITIAL_VENTAS),
    creditos: getLocalStorage<CreditoCliente[]>('alico_creditos', INITIAL_CREDITOS),
    prestamos: getLocalStorage<PrestamoBotella[]>('alico_prestamos', INITIAL_PRESTAMOS),
  };
};

export const saveMockData = (newData: Partial<MockDataStore>): void => {
  if (newData.sedes) {
    setLocalStorage('alico_sedes', newData.sedes);
    syncTableToSupabase('sedes');
  }
  if (newData.productos) {
    setLocalStorage('alico_productos', newData.productos);
    syncTableToSupabase('productos');
  }
  if (newData.mesas) {
    setLocalStorage('alico_mesas', newData.mesas);
    syncTableToSupabase('mesas');
  }
  if (newData.movimientos) {
    setLocalStorage('alico_movimientos', newData.movimientos);
    syncTableToSupabase('movimientos');
  }
  if (newData.ventas) {
    setLocalStorage('alico_ventas', newData.ventas);
    syncTableToSupabase('ventas');
  }
  if (newData.creditos) {
    setLocalStorage('alico_creditos', newData.creditos);
    syncTableToSupabase('creditos');
  }
  if (newData.prestamos) {
    setLocalStorage('alico_prestamos', newData.prestamos);
    syncTableToSupabase('prestamos');
  }
};

// ==========================================
// MOCK STATE ACTIONS
// ==========================================
export const mockDb = {
  getSedes: (): Sede[] => {
    const sedes = getMockData().sedes;
    // Ocultar 'sede-centro' (Alico Express Centro) para dejar activa solo la sede con más mesas ('sede-norte').
    // Si en el futuro es necesario habilitarla, solo basta con remover este filtro.
    return sedes.filter(s => s.id !== 'sede-centro');
  },
  addSede: (sede: Omit<Sede, 'id'>): Sede => {
    const data = getMockData();
    const newSede: Sede = { id: 'sede-' + Date.now(), ...sede };
    data.sedes.push(newSede);
    saveMockData(data);
    return newSede;
  },
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
        sede_id: prod.sede_id
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
    saveMockData(data);
    return result;
  },
  deleteProducto: (id: string): boolean => {
    const data = getMockData();
    data.productos = data.productos.filter(p => p.id !== id);
    saveMockData(data);
    deleteFromSupabase('productos', id);
    return true;
  },
  getMesas: (sedeId?: string): Mesa[] => {
    const mesas = getMockData().mesas;
    return sedeId ? mesas.filter(m => m.sede_id === sedeId) : mesas;
  },
  updateMesaEstado: (mesaId: string, estado: 'DISPONIBLE' | 'OCUPADA' | 'PAGANDO', clienteNombre = ''): Mesa | null => {
    const data = getMockData();
    const idx = data.mesas.findIndex(m => m.id === mesaId);
    if (idx !== -1) {
      data.mesas[idx].estado = estado;
      if (estado === 'DISPONIBLE') {
        data.mesas[idx].cliente_nombre = '';
        data.mesas[idx].consumos = [];
      } else if (clienteNombre) {
        data.mesas[idx].cliente_nombre = clienteNombre;
      }
      saveMockData(data);
      return data.mesas[idx];
    }
    return null;
  },
  agregarConsumoMesa: (mesaId: string, producto: Producto, cantidad: number, atendidoPor: string): Mesa | null => {
    const data = getMockData();
    const idx = data.mesas.findIndex(m => m.id === mesaId);
    if (idx !== -1) {
      const mesa = data.mesas[idx];
      
      const prodIdx = data.productos.findIndex(p => p.id === producto.id);
      if (prodIdx !== -1) {
        if (data.productos[prodIdx].stock_actual < cantidad) {
          throw new Error(`Stock insuficiente. Solo quedan ${data.productos[prodIdx].stock_actual} unidades.`);
        }
        data.productos[prodIdx].stock_actual -= cantidad;
        data.movimientos.unshift({
          id: 'mov-' + Date.now(),
          producto_id: producto.id,
          producto_nombre: producto.nombre,
          sede_id: mesa.sede_id,
          tipo: 'EGRESO',
          cantidad: cantidad,
          motivo: `Consumo en ${mesa.numero_mesa}`,
          registrado_por: atendidoPor,
          fecha_hora: new Date().toISOString()
        });
      }

      const consumoExistente = mesa.consumos.find(c => c.producto_id === producto.id);
      if (consumoExistente) {
        consumoExistente.cantidad += cantidad;
      } else {
        mesa.consumos.push({
          id: 'c-' + Date.now(),
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: cantidad,
          precio_unitario: producto.precio_venta,
          registrado_por: atendidoPor
        });
      }
      mesa.estado = 'OCUPADA';
      saveMockData(data);
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
          data.productos[prodIdx].stock_actual += cons.cantidad;
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
        saveMockData(data);
        return mesa;
      }
    }
    return null;
  },
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
          if (data.productos[prodIdx].stock_actual < item.cantidad) {
            throw new Error(`Stock insuficiente para ${item.nombre}.`);
          }
          data.productos[prodIdx].stock_actual -= item.cantidad;
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
    saveMockData(data);
    return newVenta;
  },
  getMovimientos: (sedeId?: string): Movimiento[] => {
    const movs = getMockData().movimientos;
    return sedeId ? movs.filter(m => m.sede_id === sedeId) : movs;
  },
  getCategorias: (): string[] => {
    const defaultCats = ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Varios'];
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
    saveMockData(data);
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
      saveMockData(data);
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
    saveMockData(data);
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

      saveMockData(data);
      return prestamo;
    }
    return null;
  },
  getCierres: (sedeId?: string): CierreCaja[] => {
    const cierres = getLocalStorage<CierreCaja[]>('alico_cierres', []);
    return /^\s*$/.test(sedeId || '') ? cierres : cierres.filter(c => c.sede_id === sedeId);
  },
  registrarCierre: (cierre: Omit<CierreCaja, 'id' | 'fecha_hora'>): CierreCaja => {
    const cierres = getLocalStorage<CierreCaja[]>('alico_cierres', []);
    const newCierre: CierreCaja = {
      id: 'cierre-' + Date.now(),
      fecha_hora: new Date().toISOString(),
      ...cierre
    };
    cierres.unshift(newCierre);
    setLocalStorage('alico_cierres', cierres);
    return newCierre;
  },
  resetDbToDemo: async (): Promise<void> => {
    setLocalStorage('alico_sedes', INITIAL_SEDES);
    setLocalStorage('alico_productos', INITIAL_PRODUCTS);
    setLocalStorage('alico_mesas', INITIAL_MESAS);
    setLocalStorage('alico_movimientos', INITIAL_MOVIMIENTOS);
    setLocalStorage('alico_ventas', INITIAL_VENTAS);
    setLocalStorage('alico_creditos', INITIAL_CREDITOS);
    setLocalStorage('alico_prestamos', INITIAL_PRESTAMOS);
    setLocalStorage('alico_cierres', []);
    setLocalStorage('alico_categorias', ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Varios']);

    if (!isMockMode && supabase) {
      try {
        await supabase.from('detalle_ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('movimientos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('consumos_mesa').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('mesas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sedes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        await supabase.from('sedes').insert(INITIAL_SEDES);
        await supabase.from('productos').insert(INITIAL_PRODUCTS);
        await supabase.from('mesas').insert(INITIAL_MESAS.map(({ consumos, ...rest }) => rest));
        await supabase.from('movimientos').insert(INITIAL_MOVIMIENTOS);
        await supabase.from('ventas').insert(INITIAL_VENTAS.map(({ items, ...rest }) => rest));
        await supabase.from('creditos').insert(INITIAL_CREDITOS);
        await supabase.from('prestamos').insert(INITIAL_PRESTAMOS);
      } catch (err) {
        console.error('Error reset remote Supabase:', err);
      }
    }
  },
  clearAllData: async (): Promise<void> => {
    const defaultSedes = [{ id: 'sede-norte', nombre: 'Licorera & Bar Alico Norte', direccion: 'Av. Principal #102' }];
    const defaultMesas = [
      { id: 'm1', sede_id: 'sede-norte', numero_mesa: 'Mesa 1', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] },
      { id: 'm2', sede_id: 'sede-norte', numero_mesa: 'Mesa 2', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] },
      { id: 'm3', sede_id: 'sede-norte', numero_mesa: 'Mesa 3', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] },
      { id: 'm4', sede_id: 'sede-norte', numero_mesa: 'Barra Asientos', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] }
    ];

    setLocalStorage('alico_sedes', defaultSedes);
    setLocalStorage('alico_productos', []);
    setLocalStorage('alico_mesas', defaultMesas);
    setLocalStorage('alico_movimientos', []);
    setLocalStorage('alico_ventas', []);
    setLocalStorage('alico_creditos', []);
    setLocalStorage('alico_prestamos', []);
    setLocalStorage('alico_cierres', []);
    setLocalStorage('alico_categorias', ['Cervezas', 'Licores', 'Vinos', 'Gaseosas', 'Varios']);

    if (!isMockMode && supabase) {
      try {
        await supabase.from('detalle_ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('movimientos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('consumos_mesa').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('mesas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sedes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        await supabase.from('sedes').insert(defaultSedes);
        await supabase.from('mesas').insert(defaultMesas.map(({ consumos, ...rest }) => rest));
      } catch (err) {
        console.error('Error clear remote Supabase:', err);
      }
    }
  }
};
